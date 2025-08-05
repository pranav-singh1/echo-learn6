import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, subject, message } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Log the contact form submission (in production, you'd send an email)
    console.log('Contact Form Submission:', {
      firstName,
      lastName,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    });

    // In production, you would:
    // 1. Send an email to tryecholearn@gmail.com
    // 2. Store in database
    // 3. Send confirmation email to user

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your message! We\'ll get back to you soon.' 
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
} 