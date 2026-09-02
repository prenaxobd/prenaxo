import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      subject,
      message,
    } = body;

    // Validate fields
    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please fill in all required fields.',
        },
        { status: 400 }
      );
    }

    // Check SMTP settings
    if (
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email configuration is missing.',
        },
        { status: 500 }
      );
    }

    // Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Khatibazar Website" <${process.env.SMTP_USER}>`,

      // Test email
      to: 'mdnadim9154@gmail.com',

      // Customer email
      replyTo: email,

      subject: `Khatibazar Contact - ${subject}`,

      text: `
New Contact Message

Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}

Message:
${message}
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully!',
    });

  } catch (error) {
    console.error('CONTACT API ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Unable to send message.',
      },
      { status: 500 }
    );
  }
}