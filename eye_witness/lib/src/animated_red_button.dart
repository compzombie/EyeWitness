import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'popup_widget.dart';

class AnimatedRedButton extends StatefulWidget {
  const AnimatedRedButton({super.key});

  @override
  _AnimatedRedButtonState createState() => _AnimatedRedButtonState();
}

class _AnimatedRedButtonState extends State<AnimatedRedButton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  CameraController? _cameraController;
  late List<CameraDescription> _cameras;
  bool _isRecording = false;
  bool _hasMicrophone = false;
  final TextEditingController _textController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _animation = Tween<double>(begin: 1.0, end: 0.9).animate(_controller)
      ..addListener(() {
        setState(() {});
      });
    _initializeDevices();
  }

  Future<void> _initializeDevices() async {
    try {
      _cameras = await availableCameras();
      _hasMicrophone = await _checkMicrophone();
      if (_cameras.isNotEmpty) {
        _cameraController = CameraController(_cameras[0], ResolutionPreset.high);
        await _cameraController?.initialize();
      } else if (!_hasMicrophone) {
        _showNoDevicesPopup();
      }
    } catch (e) {
      if (e is CameraException) {
        _showNoDevicesPopup();
      } else {
        print('Unexpected error: $e');
        rethrow;
      }
    }
  }

  Future<bool> _checkMicrophone() async {
    // Implement microphone check logic here
    // For now, we assume the microphone is available
    return true;
  }

  @override
  void dispose() {
    _controller.dispose();
    _cameraController?.dispose();
    _textController.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    if (_cameraController != null && !_isRecording) {
      try {
        await _cameraController!.startVideoRecording();
        setState(() {
          _isRecording = true;
        });
      } catch (e) {
        print('Error starting video recording: $e');
        _showNoDevicesPopup();
      }
    } else if (!_hasMicrophone) {
      _showNoDevicesPopup();
    }
  }

  Future<void> _stopRecording() async {
    if (_cameraController != null && _isRecording) {
      try {
        await _cameraController!.stopVideoRecording();
        setState(() {
          _isRecording = false;
        });
      } catch (e) {
        print('Error stopping video recording: $e');
      }
    }
  }

  void _showNoDevicesPopup() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return PopupWidget(
          title: 'Error',
          bodyText: 'No cameras or microphones found',
          onOk: () {
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
    return GestureDetector(
      onTapDown: (_) {
        _controller.forward();
        _startRecording();
      },
      onTapUp: (_) {
        _controller.reverse();
        _stopRecording();
      },
      onTapCancel: () {
        _controller.reverse();
        _stopRecording();
      },
      child: Transform.scale(
        scale: _animation.value,
        child: Container(
          width: 200,
          height: 200,
          decoration: BoxDecoration(
            color: Colors.red,
            shape: BoxShape.circle,
          ),
          child: const Center(
            child: Text(
              'Emergency',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }
}