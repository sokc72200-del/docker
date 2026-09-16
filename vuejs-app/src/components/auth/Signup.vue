<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">
          <i class="fas fa-comments"></i>
        </div>
        <h1>Chat System</h1>
        <p>Create your account</p>
      </div>

      <form @submit.prevent="signUp" class="auth-form">
        <div class="form-group">
          <label>Name</label>
          <div class="input-wrapper">
            <i class="fas fa-user"></i>
            <input
              type="text"
              v-model="user.name"
              placeholder="Your full name"
              :class="{ 'is-invalid': !!userError.name }"
            />
          </div>
          <div v-if="userError.name" class="error-text">{{ userError.name }}</div>
        </div>

        <div class="form-group">
          <label>Email</label>
          <div class="input-wrapper">
            <i class="fas fa-envelope"></i>
            <input
              type="email"
              v-model="user.email"
              placeholder="Enter your email"
              :class="{ 'is-invalid': !!userError.email }"
            />
          </div>
          <div v-if="userError.email" class="error-text">{{ userError.email }}</div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-wrapper">
            <i class="fas fa-lock"></i>
            <input
              type="password"
              v-model="user.password"
              placeholder="Create a password"
              autocomplete="new-password"
              :class="{ 'is-invalid': !!userError.password }"
            />
          </div>
          <div v-if="userError.password" class="error-text">{{ userError.password }}</div>
        </div>

        <div class="form-group">
          <label>Confirm Password</label>
          <div class="input-wrapper">
            <i class="fas fa-lock"></i>
            <input
              type="password"
              v-model="user.password_confirmation"
              placeholder="Confirm your password"
              autocomplete="new-password"
            />
          </div>
        </div>

        <button type="submit" class="btn-primary-auth" :disabled="isLoading">
          <span v-if="isLoading"><i class="fas fa-spinner fa-spin"></i> Creating account...</span>
          <span v-else>Sign Up</span>
        </button>
      </form>

      <div class="auth-divider">
        <span>or</span>
      </div>

      <div class="social-buttons">
        <button type="button" class="btn-social btn-google" @click="oAuthSignUp('google')">
          <i class="fab fa-google"></i> Continue with Google
        </button>
        <button type="button" class="btn-social btn-github" @click="oAuthSignUp('github')">
          <i class="fab fa-github"></i> Continue with GitHub
        </button>
      </div>

      <div class="auth-footer">
        <p>
          Already have an account?
          <router-link :to="{ name: 'auth.signin' }">Sign in</router-link>
        </p>
      </div>

      <div v-if="signedUpEmail" class="verify-box">
        <p>
          Account created for <strong>{{ signedUpEmail }}</strong>
        </p>
        <p class="mb-2">Didn't receive the verification email?</p>
        <button type="button" class="btn-resend" @click="sendVerificationEmail">
          Resend Verification Email
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { apiSignUp, apiSendVerificationEmail } from '@/functions/api/auth'
import { LoadingModal, MessageModal, CloseModal } from '@/functions/swal'
import { apiOAuthRedirect } from '@/functions/api/oauth'

const isLoading = ref(false)

const user = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const userError = reactive({
  name: '',
  email: '',
  password: '',
})

const defaultUser = JSON.parse(JSON.stringify(user))
const defaultUserError = JSON.parse(JSON.stringify(userError))

function resetAllState() {
  Object.assign(user, defaultUser)
  Object.assign(userError, defaultUserError)
}

async function signUp() {
  resetSignedUpEmail()
  try {
    isLoading.value = true
    LoadingModal('Signing Up...')
    await apiSignUp(user)
    signedUpEmail.value = user.email
    resetAllState()
    return MessageModal({
      icon: 'success',
      title: 'Success',
      text: 'Your account has been created successfully.',
    })
  } catch (error) {
    const { response } = error
    if (!response) {
      return MessageModal({ icon: 'error', title: 'Error', text: error.message })
    }
    const { status, data } = response
    if (status === 422) {
      Object.keys(userError).forEach((key) => {
        userError[key] = data.errors[key] ? data.errors[key][0] : ''
      })
      return CloseModal()
    }
    return MessageModal({ icon: 'error', title: 'Error', text: data.message })
  } finally {
    isLoading.value = false
  }
}

const signedUpEmail = ref('')

async function sendVerificationEmail() {
  try {
    LoadingModal('Requesting verification email...')
    const response = await apiSendVerificationEmail(signedUpEmail.value)
    const { data } = response
    return MessageModal({
      icon: 'success',
      title: 'Success',
      text: data.message,
    })
  } catch (error) {
    const { response } = error
    if (!response) {
      return MessageModal({ icon: 'error', title: 'Error', text: error.message })
    }
    const { data } = response
    return MessageModal({ icon: 'error', title: 'Error', text: data.message })
  }
}

function resetSignedUpEmail() {
  signedUpEmail.value = ''
}

const oAuthSignUp = async (driver) => {
  try {
    LoadingModal()
    const response = await apiOAuthRedirect(driver)
    window.location.href = response.data.redirect_url
  } catch (error) {
    return MessageModal({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || error.message,
    })
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1b2140 0%, #2a3158 50%, #5b6ef5 100%);
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  padding: 40px 36px;
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-logo {
  width: 56px;
  height: 56px;
  margin: 0 auto 14px;
  background: linear-gradient(135deg, #5b6ef5, #7c6ff0);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
}

.auth-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1b2140;
  margin: 0 0 6px;
}

.auth-header p {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1b2140;
  margin-bottom: 6px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.9rem;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 1.5px solid #e5e7f0;
  border-radius: 12px;
  font-size: 0.95rem;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  outline: none;
}

.input-wrapper input:focus {
  border-color: #5b6ef5;
  box-shadow: 0 0 0 3px rgba(91, 110, 245, 0.15);
}

.input-wrapper input.is-invalid {
  border-color: #ef4444;
}

.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 5px;
}

.btn-primary-auth {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #5b6ef5, #4c5ee8);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.15s;
  margin-top: 8px;
}

.btn-primary-auth:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.btn-primary-auth:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-divider {
  display: flex;
  align-items: center;
  margin: 22px 0;
  color: #9ca3af;
  font-size: 0.85rem;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7f0;
}

.auth-divider span {
  padding: 0 14px;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-social {
  width: 100%;
  padding: 11px;
  border-radius: 12px;
  border: 1.5px solid #e5e7f0;
  background: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-social:hover {
  background: #f8f9fc;
}

.btn-google:hover {
  border-color: #ea4335;
  color: #ea4335;
}

.btn-github:hover {
  border-color: #333;
  color: #333;
}

.auth-footer {
  text-align: center;
  margin-top: 22px;
  font-size: 0.9rem;
  color: #6b7280;
}

.auth-footer a {
  color: #5b6ef5;
  font-weight: 500;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.verify-box {
  margin-top: 20px;
  padding: 16px;
  background: #f0f4ff;
  border-radius: 12px;
  text-align: center;
  font-size: 0.9rem;
  color: #1b2140;
}

.btn-resend {
  width: 100%;
  padding: 10px;
  background: #5b6ef5;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-resend:hover {
  opacity: 0.9;
}

body.dark-mode .auth-card {
  background: #1f2444;
}

body.dark-mode .auth-header h1,
body.dark-mode .form-group label {
  color: #e7e9f5;
}

body.dark-mode .auth-header p,
body.dark-mode .auth-footer {
  color: #9ca3c9;
}

body.dark-mode .input-wrapper input {
  background: #171b34;
  border-color: #2e3357;
  color: #e7e9f5;
}

body.dark-mode .btn-social {
  background: #171b34;
  border-color: #2e3357;
  color: #e7e9f5;
}

body.dark-mode .auth-divider::before,
body.dark-mode .auth-divider::after {
  background: #2e3357;
}

body.dark-mode .verify-box {
  background: rgba(91, 110, 245, 0.15);
  color: #e7e9f5;
}
</style>
