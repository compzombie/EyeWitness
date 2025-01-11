import 'package:flutter/material.dart';

class PopupWidget extends StatelessWidget {
  final String title;
  final String bodyText;
  final VoidCallback onOk;
  final VoidCallback onCancel;
  final TextEditingController? textController;
  final List<Widget>? formWidgets;

  const PopupWidget({
    super.key,
    required this.title,
    required this.bodyText,
    required this.onOk,
    required this.onCancel,
    this.textController,
    this.formWidgets,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(title),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(bodyText),
            if (formWidgets != null) ...formWidgets!,
            if (textController != null)
              TextField(
                controller: textController,
                decoration: const InputDecoration(hintText: 'Enter your input here'),
              ),
          ],
        ),
      ),
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
