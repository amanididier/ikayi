import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Patch only the launch theme: never touch launcher/adaptive icon resources.
export function fixAndroidStartup(root = process.cwd()) {
  const main = path.join(root, 'android/app/src/main');
  const manifestPath = path.join(main, 'AndroidManifest.xml');
  if (!fs.existsSync(manifestPath)) throw new Error('Android project missing. Run npx cap add android first.');
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  const activity = [...manifest.matchAll(/<activity\b[\s\S]*?<\/activity>/g)]
    .find(([xml]) => xml.includes('android.intent.action.MAIN') && xml.includes('android.intent.category.LAUNCHER'))?.[0];
  const theme = activity?.match(/android:theme="@style\/([^"\s]+)"/)?.[1];
  if (!theme || !/^[\w.]+$/.test(theme)) throw new Error('Cannot identify a unique launcher activity theme; no resources changed.');
  const res = path.join(main, 'res');
  const basePath = path.join(res, 'values/styles.xml');
  const base = fs.readFileSync(basePath, 'utf8');
  const escaped = theme.replaceAll('.', '\\.');
  const stylePattern = new RegExp('<style\\b(?=[^>]*\\bname="' + escaped + '")[^>]*>[\\s\\S]*?<\\/style>');
  const original = base.match(stylePattern)?.[0];
  if (!original) throw new Error('Launch theme ' + theme + ' not found in values/styles.xml; no resources changed.');
  const blank = '@drawable/ikayi_startup_blank';
  const background = '@color/ikayi_startup_background';
  function patchStyle(style, platform = false) {
    const items = {
      'android:windowBackground': background,
      'android:windowIsTranslucent': 'false',
    };
    if (/Theme\.SplashScreen/.test(style) || /name="windowSplashScreen/.test(style)) {
      items.windowSplashScreenBackground = background;
      items.windowSplashScreenAnimatedIcon = blank;
      items.windowSplashScreenAnimationDuration = '0';
    }
    if (platform) {
      items['android:windowSplashScreenBackground'] = background;
      items['android:windowSplashScreenAnimatedIcon'] = blank;
      items['android:windowSplashScreenAnimationDuration'] = '0';
      items['android:windowSplashScreenIconBackgroundColor'] = background;
    }
    for (const [name, value] of Object.entries(items)) {
      const pattern = new RegExp('<item\\s+name="' + name + '"[^>]*>[\\s\\S]*?<\\/item>');
      const item = '<item name="' + name + '">' + value + '</item>';
      style = pattern.test(style) ? style.replace(pattern, item) : style.replace('</style>', '    ' + item + '\n    </style>');
    }
    return style;
  }
  const changes = [];
  for (const folder of fs.readdirSync(res).filter((name) => /^values(?:-|$)/.test(name))) {
    for (const file of fs.readdirSync(path.join(res, folder)).filter((name) => name.endsWith('.xml'))) {
      const target = path.join(res, folder, file);
      const text = fs.readFileSync(target, 'utf8');
      if (stylePattern.test(text)) {
        changes.push([
          target,
          text.replace(stylePattern, (style) => patchStyle(style, /-v(?:3[1-9]|[4-9]\d)/.test(folder))),
        ]);
      }
    }
  }
  const v31Path = path.join(res, 'values-v31/styles.xml');
  const v31 = fs.existsSync(v31Path)
    ? fs.readFileSync(v31Path, 'utf8')
    : '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n</resources>\n';
  if (!stylePattern.test(v31)) {
    changes.push([v31Path, v31.replace('</resources>', patchStyle(original, true) + '\n</resources>')]);
  }
  changes.push([
    path.join(res, 'values/ikayi_startup.xml'),
    '<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="ikayi_startup_background">#FAF8F5</color></resources>\n',
  ]);
  changes.push([
    path.join(res, 'drawable/ikayi_startup_blank.xml'),
    '<?xml version="1.0" encoding="utf-8"?>\n<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle"><size android:width="1dp" android:height="1dp"/><solid android:color="@android:color/transparent"/></shape>\n',
  ]);
  for (const [target, content] of changes) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  return { theme, files: changes.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.includes('--if-present') && !fs.existsSync('android/app/src/main/AndroidManifest.xml')) {
      console.log('No native Android project here; startup patch skipped.');
    } else {
      const result = fixAndroidStartup();
      console.log('Ikayi startup theme patched (' + result.theme + '); launcher logo unchanged.');
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Startup patch failed');
    process.exitCode = 1;
  }
}
