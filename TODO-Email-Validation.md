# TODO: Email Validation Implementation

## Current Branch: feature/mailerService-email-validation

## Steps to Complete:

### Phase 1: Dependencies and Core Setup
- [ ] Install nodemailer and @sendgrid/mail packages
- [ ] Install handlebars for email templates
- [ ] Update backend/package.json

### Phase 2: User Model Updates
- [ ] Add verification token field to user model
- [ ] Add email verification boolean field to user model
- [ ] Update user model with token generation method

### Phase 3: Email Service Creation
- [ ] Create `backend/services/emailService.js` with SendGrid integration
- [ ] Create email verification template
- [ ] Implement email sending functionality

### Phase 4: Auth Controller Updates
- [ ] Modify registration to generate verification token
- [ ] Send verification email after registration
- [ ] Create email verification endpoint
- [ ] Update login to check email verification

### Phase 5: Routes
- [ ] Add email verification route
- [ ] Update auth routes

### Phase 6: Testing
- [ ] Test email verification flow
- [ ] Test token validation
- [ ] Test email sending

## Files to be Modified/Created:
- [ ] `backend/package.json`
- [ ] `backend/models/userModel.js`
- [ ] `backend/services/emailService.js`
- [ ] `backend/templates/emailVerification.hbs`
- [ ] `backend/controllers/authController.js`
- [ ] `backend/routes/authRoutes.js`

## Environment Variables Needed:
- SENDGRID_API_KEY
- FROM_EMAIL
- FRONTEND_URL (for verification links)
