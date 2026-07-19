# FASO TV — Plateforme IPTV

Plateforme IPTV complète pour **FASO ÉQUIPEMENTS STORE (FAEST)**, Ouagadougou, Burkina Faso.

## Stack technique
- **Backend** : Django 5 + Django REST Framework + PostgreSQL + Redis
- **Frontend** : React 18 + Vite + TailwindCSS + HLS.js
- **Auth** : JWT (djangorestframework-simplejwt)
- **Paiement** : Interface Mobile Money (Orange Money, Moov Money, Coris Money — stubs dev)
- **Déploiement** : Docker + docker-compose (prêt pour Coolify)

## Démarrage rapide

### Prérequis
- Python 3.12+, PostgreSQL 16, Redis 7, Node 20
- Docker + docker-compose (pour déploiement)

### 1. Backend (développement)

```bash
cd backend
python -m venv venv
# Windows :
venv\Scripts\activate
# Linux/Mac :
source venv/bin/activate

pip install -r requirements.txt

# Copier et configurer les variables d'environnement
cp ../.env.example ../.env
# Éditer .env avec vos valeurs

# Migrations
python manage.py migrate

# Données de démo
python manage.py seed_data

# Lancer le serveur
python manage.py runserver
```

### 2. Frontend (développement)

```bash
cd frontend
npm install
npm run dev
```

Accès : http://localhost:5173

### 3. Docker (production)

```bash
cp .env.example .env
# Éditer .env avec les vraies valeurs

docker compose up -d
```

Accès : http://localhost

## Comptes de démo

| Rôle  | Téléphone | Mot de passe |
|-------|-----------|--------------|
| Admin | 70000000  | admin123     |
| Test  | 71000000  | test123      |

## API

Documentation Swagger : http://localhost:8000/api/docs/

### Endpoints principaux
- `POST /api/accounts/login/` — Connexion JWT
- `POST /api/accounts/register/` — Inscription
- `GET  /api/channels/` — Liste des chaînes
- `GET  /api/vod/movies/` — Films
- `GET  /api/vod/series/` — Séries
- `GET  /api/subscriptions/plans/` — Forfaits
- `POST /api/subscriptions/payments/initiate/` — Initier paiement
- `POST /api/xtream/sync/` — Sync depuis panel Xtream (admin)
- `POST /api/m3u/import/url/` — Import playlist M3U (admin)

## Configuration Xtream Codes

Dans `.env` :
```
XTREAM_SERVER_URL=http://votre-panel.com:8080
XTREAM_USERNAME=votre_username
XTREAM_PASSWORD=votre_password
```

Ou via l'interface Settings → Serveur Xtream.

## Paiements Mobile Money

Les providers sont des **stubs de développement** tant que les credentials ne sont pas configurés.
En mode DEBUG, le bouton "Payer" active immédiatement l'abonnement pour tester le flux.

Pour activer les vrais paiements :
1. **Orange Money BF** : remplir `ORANGE_MONEY_MERCHANT_KEY` et `ORANGE_MONEY_PIN`
2. **Moov Money BF** : remplir `MOOV_MONEY_MERCHANT_ID` et `MOOV_MONEY_SECRET`
3. **Coris Money BF** : remplir `CORIS_MONEY_MERCHANT_ID` et `CORIS_MONEY_SECRET`

Voir `backend/subscriptions/payments.py` pour les TODO d'intégration.

## Déploiement Coolify (VPS Contabo)

1. Pousser le code sur un repo Git
2. Dans Coolify : New Service → Docker Compose → pointer le repo
3. Configurer les variables d'environnement dans Coolify (copier depuis `.env.example`)
4. Déployer

## Structure du projet

```
faso-tv/
├── backend/
│   ├── accounts/      # Auth, profils, JWT
│   ├── channels/      # Chaînes live, catégories, EPG
│   ├── vod/           # Films, séries, favoris
│   ├── subscriptions/ # Forfaits, paiements, middleware
│   ├── xtream/        # Client Xtream Codes, sync
│   ├── m3u_parser/    # Parser M3U/M3U8
│   └── core/          # Settings, URLs, WSGI
├── frontend/
│   ├── src/
│   │   ├── components/ # VideoPlayer, Sidebar, MobileNav, Layout
│   │   ├── pages/      # 10 pages complètes
│   │   ├── hooks/      # useChannels, useAuth
│   │   ├── services/   # api.js, authService.js
│   │   └── context/    # AuthContext
│   └── public/
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf
└── .env.example
```
