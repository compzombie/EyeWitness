import 'package:eye_witness/src/animated_red_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'settings/settings_controller.dart';
import 'main_list_view.dart';

class MyApp extends StatelessWidget {
  final SettingsController settingsController;

  const MyApp({super.key, required this.settingsController});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en', ''), // English, no country code
      ],
      builder: (context, child) {
        return Stack(
          children: [
            const MainListView(
              menuIconSize: 16.0, // Small and unobtrusive
              menuFontSize: 16.0, // Small and unobtrusive
            ),
            Center(
              child: AnimatedRedButton(),
            ),
          ],
        );
      },
    );
  }
}

