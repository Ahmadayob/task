// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:frontend/pages/signupPage.dart';
import 'package:frontend/widgets/social_login.dart';

class SignInPage extends StatefulWidget {
  const SignInPage({Key? key}) : super(key: key);

  @override
  _SignInPageState createState() => _SignInPageState();
}

class _SignInPageState extends State<SignInPage> {
  bool _obscurePassword = true;
  bool _rememberMe = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Container(
          width: double.infinity,
          constraints: const BoxConstraints(maxWidth: 480),
          margin: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Main content
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 48),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Top section with back button and title
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Back button
                          Container(
                            height: 40,
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            child: Row(
                              children: [
                                Container(
                                  width: 28,
                                  height: 28,
                                  alignment: Alignment.center,
                                  child: IconButton(
                                    padding: EdgeInsets.zero,
                                    icon: Icon(Icons.arrow_back, size: 24),
                                    onPressed: () {
                                      Navigator.pushReplacement(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => SignupPage(),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Login title
                          Center(
                            child: Padding(
                              padding: const EdgeInsets.only(top: 13),
                              child: Text(
                                "Login to your\nAccount",
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: Color(0xFF212121),
                                  fontFamily: 'Urbanist',
                                  fontSize: 40,
                                  fontWeight: FontWeight.w700,
                                  height: 1.1, // Approximates line-height: 44px
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),

                      // Form section
                      Padding(
                        padding: const EdgeInsets.only(top: 13),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Email field
                            Container(
                              height: 60,
                              decoration: BoxDecoration(
                                color: Color(0xFFFAFAFA),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 20,
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.email,
                                    size: 20,
                                    color: Color(0xFF9E9E9E),
                                  ),
                                  SizedBox(width: 12),
                                  Expanded(
                                    child: TextField(
                                      decoration: InputDecoration(
                                        hintText: 'Email',
                                        hintStyle: TextStyle(
                                          color: Color(0xFF9E9E9E),
                                          fontFamily: 'Urbanist',
                                          fontSize: 14,
                                          fontWeight: FontWeight.w400,
                                          letterSpacing: 0.2,
                                        ),
                                        border: InputBorder.none,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            SizedBox(height: 10),

                            // Password field
                            Container(
                              height: 60,
                              decoration: BoxDecoration(
                                color: Color(0xFFFAFAFA),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 20,
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.lock,
                                    size: 20,
                                    color: Color(0xFF9E9E9E),
                                  ),
                                  SizedBox(width: 12),
                                  Expanded(
                                    child: TextField(
                                      obscureText: _obscurePassword,
                                      decoration: InputDecoration(
                                        hintText: 'Password',
                                        hintStyle: TextStyle(
                                          color: Color(0xFF9E9E9E),
                                          fontFamily: 'Urbanist',
                                          fontSize: 14,
                                          fontWeight: FontWeight.w400,
                                          letterSpacing: 0.2,
                                        ),
                                        border: InputBorder.none,
                                      ),
                                    ),
                                  ),
                                  GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        _obscurePassword = !_obscurePassword;
                                      });
                                    },
                                    child: Icon(
                                      _obscurePassword
                                          ? Icons.visibility_off
                                          : Icons.visibility,
                                      size: 20,
                                      color: Color(0xFF9E9E9E),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            SizedBox(height: 24),

                            // Remember me checkbox
                            Row(
                              children: [
                                Container(
                                  width: 24,
                                  height: 24,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: Color(0xFF246BFD),
                                      width: 3,
                                    ),
                                  ),
                                  child: Checkbox(
                                    value: _rememberMe,
                                    onChanged: (value) {
                                      setState(() {
                                        _rememberMe = value ?? false;
                                      });
                                    },
                                    fillColor:
                                        WidgetStateProperty.resolveWith<Color>((
                                          Set<WidgetState> states,
                                        ) {
                                          return Colors.transparent;
                                        }),
                                    checkColor: Color(0xFF246BFD),
                                    materialTapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                  ),
                                ),
                                SizedBox(width: 12),
                                Text(
                                  'Remember me',
                                  style: TextStyle(
                                    color: Color(0xFF212121),
                                    fontFamily: 'Urbanist',
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 0.2,
                                  ),
                                ),
                              ],
                            ),

                            SizedBox(height: 24),

                            // Sign in button
                            Container(
                              height: 55,
                              decoration: BoxDecoration(
                                color: Color(0xFF476EBE),
                                borderRadius: BorderRadius.circular(100),
                                boxShadow: [
                                  BoxShadow(
                                    color: Color(0xFF246BFD).withOpacity(0.25),
                                    offset: Offset(4, 8),
                                    blurRadius: 24,
                                  ),
                                ],
                              ),
                              child: TextButton(
                                onPressed: () {},
                                style: ButtonStyle(
                                  padding: WidgetStateProperty.all<EdgeInsets>(
                                    EdgeInsets.symmetric(
                                      vertical: 17,
                                      horizontal: 16,
                                    ),
                                  ),
                                  backgroundColor:
                                      WidgetStateProperty.all<Color>(
                                        Colors.transparent,
                                      ),
                                  shape: WidgetStateProperty.all<
                                    RoundedRectangleBorder
                                  >(
                                    RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(100),
                                    ),
                                  ),
                                ),
                                child: Text(
                                  'Sign in',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontFamily: 'Urbanist',
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ),

                            SizedBox(height: 24),

                            // Forgot password
                            Center(
                              child: GestureDetector(
                                onTap: () {},
                                child: Text(
                                  'Forgot the password?',
                                  style: TextStyle(
                                    color: Color(0xFF246BFD),
                                    fontFamily: 'Urbanist',
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Social login section
                      Padding(
                        padding: const EdgeInsets.only(top: 13),
                        child: Column(
                          children: [
                            // Or continue with
                            Padding(
                              padding: const EdgeInsets.all(10),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Divider(
                                      color: Colors.grey[300],
                                      thickness: 1,
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                    ),
                                    child: Text(
                                      'or continue with',
                                      style: TextStyle(
                                        color: Color(0xFF616161),
                                        fontFamily: 'Urbanist',
                                        fontSize: 18,
                                        fontWeight: FontWeight.w600,
                                        letterSpacing: 0.2,
                                      ),
                                    ),
                                  ),
                                  Expanded(
                                    child: Divider(
                                      color: Colors.grey[300],
                                      thickness: 1,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            SizedBox(height: 20),
                            SizedBox(
                              width: 300,
                              child: Column(
                                children: [
                                  // Apple button
                                  SocialLoginButton(
                                    icon: Icons.apple,
                                    text: "Continue with Apple",
                                    onPressed: () {},
                                  ),

                                  const SizedBox(height: 20),

                                  // Facebook button
                                  SocialLoginButton(
                                    icon: Icons.facebook,
                                    text: "Continue with Facebook",
                                    onPressed: () {},
                                  ),

                                  const SizedBox(height: 20),

                                  // Google button
                                  SocialLoginButton(
                                    icon: Icons.g_mobiledata,
                                    text: "Continue with Google",
                                    onPressed: () {},
                                  ),
                                ],
                              ),
                            ),
                            // Sign up section
                            Padding(
                              padding: const EdgeInsets.only(top: 13),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    "Don't have an account?",
                                    style: TextStyle(
                                      color: Color(0xFF9E9E9E),
                                      fontFamily: 'Urbanist',
                                      fontSize: 14,
                                      fontWeight: FontWeight.w400,
                                      letterSpacing: 0.2,
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  GestureDetector(
                                    onTap: () {
                                      Navigator.pushReplacement(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => SignupPage(),
                                        ),
                                      );
                                    },
                                    child: Text(
                                      "Sign up",
                                      style: TextStyle(
                                        color: Color(0xFF246BFD),
                                        fontFamily: 'Urbanist',
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        letterSpacing: 0.2,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
