# Keycloak Sayfaları - Shadcn/UI Özelleştirme Durumu

## ✅ Özelleştirilmiş Sayfalar (14 sayfa)

Bu sayfalar shadcn/ui ile özelleştirilmiş ve `KcPage.tsx`'te route edilmiş:

1. **login.ftl** - LoginPage.tsx ✅
   - Kullanıcı giriş sayfası
   - Kullanıcı adı/email ve şifre girişi
   - Social login desteği
   - "Beni hatırla" checkbox'ı

2. **register.ftl** - RegisterPage.tsx ✅
   - Kullanıcı kayıt sayfası
   - UserProfileFormFields kullanıyor

3. **login-reset-password.ftl** - ResetPasswordPage.tsx ✅
   - Şifre sıfırlama isteği sayfası
   - Email/kullanıcı adı girişi

4. **error.ftl** - ErrorPage.tsx ✅
   - Hata sayfası
   - Hata mesajı gösterimi
   - Uygulamaya dönüş butonu

5. **info.ftl** - InfoPage.tsx ✅
   - Bilgi sayfası
   - Mesaj gösterimi
   - Gerekli aksiyonlar listesi

6. **login-update-password.ftl** - LoginUpdatePasswordPage.tsx ✅
   - Şifre güncelleme sayfası
   - Yeni şifre ve onay alanları

7. **login-verify-email.ftl** - LoginVerifyEmailPage.tsx ✅
   - Email doğrulama sayfası
   - Email adresi gösterimi
   - Devam butonu

8. **login-update-profile.ftl** - LoginUpdateProfilePage.tsx ✅
   - Profil güncelleme sayfası
   - UserProfileFormFields kullanıyor

9. **login-otp.ftl** - LoginOtpPage.tsx ✅
   - OTP (One-Time Password) giriş sayfası
   - Select component ile OTP seçimi

10. **login-config-totp.ftl** - LoginConfigTotpPage.tsx ✅
    - TOTP yapılandırma sayfası
    - QR kod gösterimi
    - Manuel giriş kodu

11. **terms.ftl** - TermsPage.tsx ✅
    - Şartlar ve koşullar sayfası
    - Scrollable içerik
    - Onay checkbox'ı

12. **logout-confirm.ftl** - LogoutConfirmPage.tsx ✅
    - Çıkış onay sayfası
    - Çıkış ve iptal butonları

13. **login-username.ftl** - LoginUsernamePage.tsx ✅
    - Kullanıcı adı giriş sayfası
    - İki aşamalı giriş için

14. **login-password.ftl** - LoginPasswordPage.tsx ✅
    - Şifre giriş sayfası
    - İki aşamalı giriş için

---

## ❌ Özelleştirilmemiş Sayfalar (28 sayfa)

Bu sayfalar hala `DefaultPage` kullanıyor ve shadcn/ui ile özelleştirilmemiş:

### 🔐 Kimlik Doğrulama Sayfaları (8 sayfa)

1. **code.ftl** - Code.stories.tsx
   - Kod giriş sayfası (email doğrulama kodu, vb.)
   - Input alanı gerekli

2. **login-page-expired.ftl** - LoginPageExpired.stories.tsx
   - Oturum süresi dolmuş sayfası
   - Bilgi mesajı ve yeniden giriş linki

3. **select-authenticator.ftl** - SelectAuthenticator.stories.tsx
   - Kimlik doğrulayıcı seçim sayfası
   - Select component ile seçim yapılabilir

4. **login-passkeys-conditional-authenticate.ftl** - LoginPasskeysConditionalAuthenticate.stories.tsx
   - Passkeys koşullu kimlik doğrulama
   - WebAuthn ile ilgili

5. **login-recovery-authn-code-config.ftl** - LoginRecoveryAuthnCodeConfig.stories.tsx
   - Kurtarma kimlik doğrulama kodu yapılandırma
   - Form alanları gerekli

6. **login-recovery-authn-code-input.ftl** - LoginRecoveryAuthnCodeInput.stories.tsx
   - Kurtarma kimlik doğrulama kodu girişi
   - Input alanı gerekli

7. **login-reset-otp.ftl** - LoginResetOtp.stories.tsx
   - OTP sıfırlama sayfası
   - Form alanları gerekli

8. **login-x509-info.ftl** - LoginX509Info.stories.tsx
   - X509 sertifika bilgisi sayfası
   - Bilgi gösterimi

### 🔗 Identity Provider (IdP) Sayfaları (4 sayfa)

9. **login-idp-link-confirm.ftl** - LoginIdpLinkConfirm.stories.tsx
   - IdP bağlantı onay sayfası
   - Onay butonu gerekli

10. **login-idp-link-confirm-override.ftl** - LoginIdpLinkConfirmOverride.stories.tsx
    - IdP bağlantı onay override sayfası
    - Onay butonu gerekli

11. **login-idp-link-email.ftl** - LoginIdpLinkEmail.stories.tsx
    - IdP email bağlantı sayfası
    - Email input gerekli

12. **idp-review-user-profile.ftl** - IdpReviewUserProfile.stories.tsx
    - IdP kullanıcı profili inceleme sayfası
    - Form alanları gerekli

### 🔐 OAuth/OAuth2 Sayfaları (2 sayfa)

13. **login-oauth-grant.ftl** - LoginOauthGrant.stories.tsx
    - OAuth izin sayfası
    - İzin onayı ve reddetme butonları

14. **login-oauth2-device-verify-user-code.ftl** - LoginOauth2DeviceVerifyUserCode.stories.tsx
    - OAuth2 cihaz kullanıcı kodu doğrulama
    - Kod girişi gerekli

### 🔒 WebAuthn Sayfaları (3 sayfa)

15. **webauthn-authenticate.ftl** - WebauthnAuthenticate.stories.tsx
    - WebAuthn kimlik doğrulama sayfası
    - Cihaz seçimi ve doğrulama

16. **webauthn-register.ftl** - WebauthnRegister.stories.tsx
    - WebAuthn kayıt sayfası
    - Cihaz kayıt işlemi

17. **webauthn-error.ftl** - WebauthnError.stories.tsx
    - WebAuthn hata sayfası
    - Hata mesajı gösterimi

### 🏢 Organizasyon Sayfaları (1 sayfa)

18. **select-organization.ftl** - SelectOrganization.stories.tsx
    - Organizasyon seçim sayfası
    - Select component ile seçim

### 📧 Email Sayfaları (1 sayfa)

19. **update-email.ftl** - UpdateEmail.stories.tsx
    - Email güncelleme sayfası
    - Email input ve onay

### 🗑️ Hesap Yönetimi Sayfaları (2 sayfa)

20. **delete-account-confirm.ftl** - DeleteAccountConfirm.stories.tsx
    - Hesap silme onay sayfası
    - Onay ve iptal butonları

21. **delete-credential.ftl** - DeleteCredential.stories.tsx
    - Kimlik bilgisi silme sayfası
    - Onay ve iptal butonları

### 🔐 SAML Sayfaları (1 sayfa)

22. **saml-post-form.ftl** - SamlPostForm.stories.tsx
    - SAML POST form sayfası
    - Otomatik form gönderimi (genelde gizli)

### 🔄 Logout Sayfaları (1 sayfa)

23. **frontchannel-logout.ftl** - FrontchannelLogout.stories.tsx
    - Frontchannel logout sayfası
    - Otomatik logout işlemi

---

## 📊 Özet

- **Toplam Sayfa:** 42 sayfa
- **Özelleştirilmiş:** 14 sayfa (33%)
- **Kalan:** 28 sayfa (67%)

## 🎯 Öncelik Sırası (Önerilen)

### Yüksek Öncelik (Sık Kullanılan)
1. **code.ftl** - Email doğrulama kodu girişi
2. **select-authenticator.ftl** - Kimlik doğrulayıcı seçimi
3. **update-email.ftl** - Email güncelleme
4. **login-idp-link-email.ftl** - IdP email bağlantı
5. **login-oauth-grant.ftl** - OAuth izin sayfası

### Orta Öncelik
6. **login-page-expired.ftl** - Oturum süresi dolmuş
7. **select-organization.ftl** - Organizasyon seçimi
8. **delete-account-confirm.ftl** - Hesap silme onayı
9. **delete-credential.ftl** - Kimlik bilgisi silme
10. **login-idp-link-confirm.ftl** - IdP bağlantı onayı

### Düşük Öncelik (Nadir Kullanılan)
- WebAuthn sayfaları (3 sayfa)
- OAuth2 device sayfaları (1 sayfa)
- Recovery code sayfaları (2 sayfa)
- SAML sayfaları (1 sayfa)
- Frontchannel logout (1 sayfa)

