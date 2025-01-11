import 'package:flutter/material.dart';
import 'animated_red_button.dart';

class MainListView extends StatelessWidget {
  final double menuIconSize;
  final double menuFontSize;

  const MainListView({
    super.key,
    this.menuIconSize = 24.0,
    this.menuFontSize = 24.0,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Custom List View'),
        leading: Builder(
          builder: (context) {
            return IconButton(
              icon: Icon(Icons.menu, size: menuIconSize),
              onPressed: () {
                Scaffold.of(context).openDrawer();
              },
            );
          },
        ),
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: <Widget>[
            DrawerHeader(
              decoration: const BoxDecoration(
                color: Colors.blue,
              ),
              child: Text(
                'Menu',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: menuFontSize,
                ),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.home),
              title: const Text('Home'),
              onTap: () {
                // Handle the home tap
              },
            ),
            ListTile(
              leading: const Icon(Icons.settings),
              title: const Text('Settings'),
              onTap: () {
                // Handle the settings tap
              },
            ),
          ],
        ),
      ),
      body: ListView(
        children: const <Widget>[
          ListTile(
            title: Text('Item 1'),
          ),
        ],
      ),
    );
  }
}