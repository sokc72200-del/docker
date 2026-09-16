<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">
          <i class="fas fa-key"></i>
        </div>
        <h1>Reset Password</h1>
        <p>Enter your email to receive a reset link</p>
      </div>

      <form @submit.prevent="sendResetPasswordEmail" class="auth-form">
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

        <button type="submit" class="btn-primary-auth" :disabled="isLoading">
          <span v-if="isLoading"><i class="fas fa-spinner fa-spin"></i> Sending...</span>
          <span v-else>Send Reset Link</span>
        </button>
      </form>

      <div class="auth-footer">
        <p>
          <router-link :to="{ name: 'auth.signin' }">Back to Sign In</router-link>
        </p>
        <p>
          Don't have an account?
          <router-link :to="{ name: 'auth.signup' }">Sign up</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { apiSendResetPasswordEmail } from '@/functions/api/auth'
import { LoadingModal, MessageModal, CloseModal } from '@/functions/swal'

const isLoading = ref(false)

const user = reactive({
  email: '',
})

const userError = reactive({
  email: '',
})

const defaultUser = JSON.parse(JSON.stringify(user))
const defaultUserError = JSON.parse(JSON.stringify(userError))

function resetAllState() {
  Object.assign(user, defaultUser)
  Object.assign(userError, defaultUserError)
}

async function sendResetPasswordEmail() {
  try {
    isLoading.value = true
    LoadingModal()
    const response = await apiSendResetPasswordEmail(user.email)
    resetAllState()
    return MessageModal({ icon: 'success', title: 'Success', text: response.data.message })
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
  margin-bottom: 18px;
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

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 0.9rem;
  color: #6b7280;
}

.auth-footer p {
  margin: 6px 0;
}

.auth-footer a {
  color: #5b6ef5;
  font-weight: 500;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
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
</style>
