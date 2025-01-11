import 'package:flutter/material.dart';
import 'animated_red_button.dart';

class MainListView extends StatefulWidget {
  final double menuIconSize;
  final double menuFontSize;

  const MainListView({
    super.key,
    this.menuIconSize = 24.0,
    this.menuFontSize = 24.0,
  });

  @override
  _MainListViewState createState() => _MainListViewState();
}

class _MainListViewState extends State<MainListView> {
  final Map<String, List<String>> _subItems = {
    'General': ['Option 1', 'Option 2', 'Option 3'],
    'Security': ['Option 1', 'Option 2', 'Option 3'],
    'Local Storage': ['Option 1', 'Option 2', 'Option 3'],
    'Cloud Storage': ['Option 1', 'Option 2', 'Option 3'],
  };

  String? _selectedItem;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Options'),
        leading: Builder(
          builder: (context) {
            return IconButton(
              icon: Icon(Icons.menu, size: widget.menuIconSize),
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
            ListTile(
              leading: const Icon(Icons.home),
              title: const Text('Home'),
              onTap: () {
                // Handle the home tap
              },
            ),
            ..._subItems.keys.map((key) {
              return ExpansionTile(
                leading: Icon(_getIconForKey(key)),
                title: Text(key),
                children: _subItems[key]!
                    .map((subItem) => ListTile(
                          title: Text(subItem),
                          onTap: () {
                            setState(() {
                              _selectedItem = subItem;
                            });
                          },
                        ))
                    .toList(),
              );
            }).toList(),
          ],
        ),
      ),
      body: Center(
        child: Text(_selectedItem ?? 'Main Content Area'),
      ),
    );
  }

  IconData _getIconForKey(String key) {
    switch (key) {
      case 'General':
        return Icons.settings;
      case 'Security':
        return Icons.security;
      case 'Local Storage':
        return Icons.storage;
      case 'Cloud Storage':
        return Icons.cloud;
      default:
        return Icons.help;
    }
  }
}