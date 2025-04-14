class Attachment {
  final String name;
  final String type;
  final String url;
  final DateTime uploadedAt;

  Attachment({
    required this.name,
    required this.type,
    required this.url,
    required this.uploadedAt,
  });

  factory Attachment.fromJson(Map<String, dynamic> json) {
    return Attachment(
      name: json['name'] ?? '',
      type: json['type'] ?? '',
      url: json['url'] ?? '',
      uploadedAt:
          json['uploadedAt'] != null
              ? DateTime.parse(json['uploadedAt'])
              : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'type': type,
      'url': url,
      'uploadedAt': uploadedAt.toIso8601String(),
    };
  }
}
