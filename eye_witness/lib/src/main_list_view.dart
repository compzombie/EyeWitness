import 'package:flutter/material.dart';
import 'animated_red_button.dart';
import 'popup_widget.dart';

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
  final TextEditingController _textController = TextEditingController();
  String? _selectedItem;

  Map<String, List<Map<String, VoidCallback>>> get _subItems => {
    'General': [
      {'Identifying Information': () => _showPopup('Identifying Information', true)},
      {'Emergency Contact': () => _showPopup('Emergency Contact', true)},
      {'Local Resources': () => _showPopup('Local Resources', true)},
    ],
    'Security': [
      {'Option 1': () => _showPopup('Security Option 1', false)},
      {'Option 2': () => _showPopup('Security Option 2', false)},
      {'Option 3': () => _showPopup('Security Option 3', false)},
    ],
    'Local Storage': [
      {'Option 1': () => _showPopup('Local Storage Option 1', false)},
      {'Option 2': () => _showPopup('Local Storage Option 2', false)},
      {'Option 3': () => _showPopup('Local Storage Option 3', false)},
    ],
    'Cloud Storage': [
      {'Option 1': () => _showPopup('Cloud Storage Option 1', false)},
      {'Option 2': () => _showPopup('Cloud Storage Option 2', false)},
      {'Option 3': () => _showPopup('Cloud Storage Option 3', false)},
    ],
  };

  void _showPopup(String title, bool includeForm) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return PopupWidget(
          title: title,
          bodyText: 'Please enter your $title',
          children: includeForm
              ? [
                  TextField(
                    controller: _textController,
                    decoration: const InputDecoration(hintText: 'Enter your input here'),
                  ),
                ]
              : null,
          onOk: () {
            setState(() {
              _selectedItem = _textController.text;
            });
            Navigator.of(context).pop();
          },
          onCancel: () {
            Navigator.of(context).pop();
          },
        );
      },
    );
  }
 
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
                          title: Text(subItem.keys.first),
                          onTap: subItem.values.first,
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