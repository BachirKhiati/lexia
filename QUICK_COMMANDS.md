# Synapse - Quick Commands Reference

**Just run `make help` to see all available commands!**

---

## 🚀 Most Common Commands

### Deploy to VM
```bash
make deploy
```
That's it! One command deploys everything to 94.237.80.109.

### Check if it's working
```bash
make health
```

### Seed demo data
```bash
make seed
```

### View logs
```bash
make logs           # All logs
make logs-backend   # Just backend
```

### Restart services
```bash
make restart
```

### Update after changes
```bash
make update
```

### SSH into VM
```bash
make ssh
```

---

## 📋 Complete Command List

Run this to see everything:
```bash
make help
```

You'll see commands organized into categories:
- 🚀 **Deployment** - Deploy and setup
- 🌱 **Database** - Seed, backup, restore
- 📊 **Monitoring** - Logs, health, performance
- 🛠️ **Management** - Start, stop, restart, update
- 💻 **Local Dev** - Build, test, develop locally
- 🔒 **Security** - Firewall, SSL

---

## 🎯 Common Workflows

### First Time Deploy
```bash
make deploy          # Deploy everything
make seed            # Add demo data
make firewall        # Configure firewall
make health          # Verify it works
```

### After Making Changes
```bash
# Make your code changes, then:
make update          # Pushes, pulls, rebuilds on VM
make health          # Verify it works
```

### Troubleshooting
```bash
make logs-backend    # Check backend logs
make status          # Check container status
make troubleshoot    # Full diagnostics
```

### Regular Maintenance
```bash
make db-backup       # Backup database
make health          # Check health
make status          # Check resources
```

---

## 💡 Tips

**See all URLs:**
```bash
make urls
```

**Custom VM IP:**
```bash
make deploy VM_IP=your.ip.here
```

**Performance test:**
```bash
make perf
```

**Database shell:**
```bash
make db-shell
```

---

## 🔗 Quick Links

After deployment:
- **App**: http://94.237.80.109
- **API Docs**: http://94.237.80.109/api/docs/index.html
- **Health**: http://94.237.80.109/health

**Login:**
- Email: `demo@synapse.app`
- Password: `Demo1234`

---

**Need help?** Run `make help` or check these docs:
- `DEPLOYMENT_READY.md` - Deployment overview
- `DEPLOY_TO_VM.md` - Detailed deployment guide
- `PRE_LAUNCH_CHECKLIST.md` - Launch checklist
