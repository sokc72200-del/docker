# ChatSystem

A real-time chat application built with **Laravel** (backend) and **Vue.js** (frontend), fully dockerized for easy development.

## Features

- Personal & Group chats
- Real-time messaging (Laravel Reverb)
- Text, Image, and Voice messages
- Message reactions
- Typing indicators
- Seen / Unread status
- Search messages
- User management
- Database backups
- Google OAuth login
- Dark / Light mode

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Backend     | Laravel 13 + PHP 8.4                |
| Frontend    | Vue 3 + Vite + TypeScript           |
| Real-time   | Laravel Reverb                      |
| Server      | Laravel Octane + RoadRunner         |
| Database    | MySQL 8.0                           |
| Admin       | phpMyAdmin                          |
| Container   | Docker + Docker Compose             |

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

No need to install PHP, Composer, Node, or MySQL on your machine.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sokc72200-del/docker.git
cd docker