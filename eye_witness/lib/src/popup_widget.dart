import 'package:flutter/material.dart';

class PopupWidget extends StatelessWidget {
  final String title;
  final String bodyText;
  final VoidCallback onOk;
  final VoidCallback onCancel;

  const PopupWidget({
    super.key,
    required this.title,
    required this.bodyText,
    required this.onOk,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(title),
      content: Text(bodyText),
      actions: <Widget>[
        TextButton(
          onPressed: onCancel,
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: onOk,
          child: const Text('OK'),
        ),
      ],
    );
  }
}
