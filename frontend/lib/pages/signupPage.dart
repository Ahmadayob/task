// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:frontend/pages/signinPage.dart';
import 'package:frontend/pages/welcomePage.dart';
import 'package:frontend/widgets/custome_inputh.dart' show CustomInputField;
import 'package:frontend/widgets/social_login.dart';

class SignupPage extends StatefulWidget {
  const SignupPage({Key? key}) : super(key: key);

  @override
  _SignupPageState createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  bool _rememberMe = false;
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Container(
          width: double.infinity,
          constraints: const BoxConstraints(maxWidth: 480),
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.only(top: 11),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Main content
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 48),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Navbar with back button
                      Container(
                        height: 50, // Increased height to ensure enough space
                        padding: const EdgeInsets.symmetric(horizontal: 1),
                        child: Row(
                          children: [
                            GestureDetector(
                              onTap: () {
                                Navigator.pushReplacement(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => WelcomePage(),
                                  ), // or any previous screen
                                );
                              },
                              child: Container(
                                width: 30,
                                height: 40,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.arrow_back,
                                  size: 24,
                                  color: Colors.black,
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                          ],
                        ),
                      ),

                      // Create your Account heading
                      Text(
                        "Create your\nAccount",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Color(0xFF212121),
                          fontFamily: 'Urbanist',
                          fontSize: 40,
                          fontWeight: FontWeight.w700,
                          height: 1.1, // Approximating line-height: 44px
                        ),
                      ),

                      // Form fields
                      Column(
                        children: [
                          // Username field
                          CustomInputField(
                            hintText: "Username",
                            prefixIcon: Icons.person,
                          ),

                          const SizedBox(height: 20),

                          // Email field
                          CustomInputField(
                            hintText: "Email",
                            prefixIcon: Icons.email,
                          ),

                          const SizedBox(height: 20),

                          // Password field
                          CustomInputField(
                            hintText: "Password",
                            prefixIcon: Icons.lock,
                            suffixIcon:
                                _obscurePassword
                                    ? Icons.visibility_off
                                    : Icons.visibility,
                            obscureText: _obscurePassword,
                            onSuffixIconTap: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                          ),

                          const SizedBox(height: 20),

                          // Remember me checkbox
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
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
                                  fillColor: WidgetStateProperty.all(
                                    Colors.transparent,
                                  ),
                                  checkColor: Color(0xFF246BFD),
                                  materialTapTargetSize:
                                      MaterialTapTargetSize.shrinkWrap,
                                  visualDensity: VisualDensity.compact,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                "Remember me",
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

                          const SizedBox(height: 20),

                          // Sign up button
                          Container(
                            width: 380,
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
                              style: TextButton.styleFrom(
                                padding: EdgeInsets.zero,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(100),
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  "Sign up",
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontFamily: 'Urbanist',
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 10),
                      // Or continue with section
                      Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Expanded(
                                child: Container(
                                  height: 1,
                                  color: Colors.grey.withOpacity(0.3),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                ),
                                child: Text(
                                  "or continue with",
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
                                child: Container(
                                  height: 1,
                                  color: Colors.grey.withOpacity(0.3),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 15),

                          // Social login buttons
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

                                const SizedBox(height: 15),

                                // Facebook button
                                SocialLoginButton(
                                  icon: Icons.facebook,
                                  text: "Continue with Facebook",
                                  onPressed: () {},
                                ),

                                const SizedBox(height: 15),

                                // Google button
                                SocialLoginButton(
                                  icon: Icons.g_mobiledata,
                                  text: "Continue with Google",
                                  onPressed: () {},
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 5),

                      // Already have an account
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "Already have an account?",
                            style: TextStyle(
                              color: Color(0xFF9E9E9E),
                              fontFamily: 'Urbanist',
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                              letterSpacing: 0.2,
                            ),
                          ),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () {
                              Navigator.pushReplacement(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => SignInPage(),
                                ),
                              );
                            },
                            child: Text(
                              "Sign in",
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
