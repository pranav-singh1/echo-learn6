# 🚀 EchoLearn Waitlist Deployment Guide

This guide will help you deploy your beautiful waitlist to **echolearn.ai** using Porkbun static hosting.

## ✅ Prerequisites

1. **Formspree Account**: Create a free account at [formspree.io](https://formspree.io)
2. **Porkbun Hosting**: Access to your domain hosting at [porkbun.com](https://porkbun.com)

## 📋 Step-by-Step Deployment

### 1. Setup Formspree (Email Collection)

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form
3. Copy your form endpoint (looks like `https://formspree.io/f/xdkogqgl`)
4. Update the form action in `WaitlistPage.tsx` if needed (currently set to a demo endpoint)

### 2. Build the Waitlist Site

```bash
# From the frontend directory
npm run build:waitlist
```

This will:
- ✅ Create a standalone waitlist build
- ✅ Generate static files in `waitlist-build/` directory
- ✅ Restore your original development files

### 3. Prepare for Upload

1. Navigate to the `waitlist-build/` directory
2. Select **ALL contents** inside (not the folder itself)
3. Create a ZIP file with all the contents

**Important**: Zip the contents, not the folder itself!

### 4. Deploy to Porkbun

1. Log into your Porkbun account
2. Go to **Account > Hosting**
3. Click on your **echolearn.ai** domain
4. Look for "Upload ZIP" or "Deploy Website" button
5. Upload your ZIP file
6. Wait 1-2 minutes for deployment

### 5. Test Your Site

Visit [https://echolearn.ai](https://echolearn.ai) - you should see your beautiful waitlist! 🎉

## 🎨 What You Get

Your waitlist includes:

- **Beautiful EchoLearn branding** with animated backgrounds
- **Email collection form** with Formspree integration
- **Feature previews** showcasing voice conversations, summaries, and quizzes
- **Social proof** with signup counters and launch timeline
- **Mobile responsive** design that works on all devices
- **Success state** after email submission

## 🔧 Customization

### Update Social Proof Numbers
Edit the social proof section in `WaitlistPage.tsx`:
```tsx
<span className="text-gray-600 font-medium">1,000+ Already Signed Up</span>
<span className="text-gray-600 font-medium">Launching Q2 2025</span>
```

### Change Formspree Endpoint
Update the fetch URL in `WaitlistPage.tsx`:
```tsx
const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
```

### Modify Launch Timeline
Update the launch date in the social proof section as needed.

## 🔍 Troubleshooting

**Form not working?**
- Check your Formspree endpoint is correct
- Ensure your Formspree form is active
- Check browser console for any errors

**Site not loading?**
- Verify all files were uploaded to Porkbun
- Check that you uploaded the contents, not the folder
- Wait a few minutes for DNS propagation

**Styling issues?**
- The site uses Tailwind CSS from CDN
- Check that your internet connection allows CDN resources

## 🎯 Next Steps

1. **Monitor signups** through your Formspree dashboard
2. **Update social proof** numbers as you grow
3. **A/B test** different headlines or descriptions
4. **Add analytics** (Google Analytics, etc.) if desired

Your waitlist is now live and collecting emails! 🌟 