# Server Setup Guide for Scorekeeper Deployment

This guide outlines the complete server configuration required for the GitHub Actions continuous deployment workflow.

## Prerequisites

- Ubuntu server with Apache2 installed
- SSH access to the server
- Domain name pointed to your server (optional but recommended)

## 1. SSH Key Configuration

### Generate SSH Key Pair (if needed)
```bash
ssh-keygen -t ed25519 -C "github-actions@scorekeeper"
```

### Add Public Key to Server
```bash
# On your server, add the public key to authorized_keys
mkdir -p ~/.ssh
echo "your-public-key-content" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Add Private Key to GitHub Secrets
- Go to GitHub Repository → Settings → Secrets and variables → Actions
- Add the following secrets:
  - `SERVER_HOST`: Your server's IP address or domain name
  - `SERVER_USER`: SSH username (e.g., `ubuntu`, `deploy`)
  - `SSH_PRIVATE_KEY`: Complete private key content (including `-----BEGIN` and `-----END` lines)

## 2. Server Directory Structure

Create the deployment directory structure:
```bash
sudo mkdir -p /var/www/scorekeeper/releases
sudo chown -R $USER:www-data /var/www/scorekeeper
sudo chmod -R 755 /var/www/scorekeeper
```

## 3. Apache Configuration

### Install Required Apache Modules
```bash
sudo a2enmod rewrite
sudo a2enmod expires
sudo a2enmod deflate
```

### Create Virtual Host Configuration
Save the provided Apache configuration to `/etc/apache2/sites-available/scorekeeper.conf`:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    # ServerAlias www.your-domain.com
    
    DocumentRoot /var/www/scorekeeper/current
    
    <Directory /var/www/scorekeeper/current>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Handle client-side routing (SPA)
        FallbackResource /index.html
    </Directory>
    
    # Enable compression for better performance
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/plain
        AddOutputFilterByType DEFLATE text/html
        AddOutputFilterByType DEFLATE text/xml
        AddOutputFilterByType DEFLATE text/css
        AddOutputFilterByType DEFLATE application/xml
        AddOutputFilterByType DEFLATE application/xhtml+xml
        AddOutputFilterByType DEFLATE application/rss+xml
        AddOutputFilterByType DEFLATE application/javascript
        AddOutputFilterByType DEFLATE application/x-javascript
    </IfModule>
    
    # Set cache headers for static assets
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/css "access plus 1 month"
        ExpiresByType application/javascript "access plus 1 month"
        ExpiresByType image/png "access plus 1 month"
        ExpiresByType image/jpg "access plus 1 month"
        ExpiresByType image/jpeg "access plus 1 month"
        ExpiresByType image/gif "access plus 1 month"
        ExpiresByType image/svg+xml "access plus 1 month"
    </IfModule>
    
    ErrorLog ${APACHE_LOG_DIR}/scorekeeper_error.log
    CustomLog ${APACHE_LOG_DIR}/scorekeeper_access.log combined
</VirtualHost>
```

### Enable Site and Restart Apache
```bash
# Update ServerName in the config file first
sudo nano /etc/apache2/sites-available/scorekeeper.conf

# Enable the site
sudo a2ensite scorekeeper.conf

# Disable default site (optional)
sudo a2dissite 000-default.conf

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

## 4. User Permissions

Ensure the deployment user has proper permissions:
```bash
# Add user to www-data group
sudo usermod -a -G www-data $USER

# Set proper ownership and permissions
sudo chown -R $USER:www-data /var/www/scorekeeper
sudo chmod -R 755 /var/www/scorekeeper

# Allow user to reload Apache (add to sudoers)
echo "$USER ALL=(ALL) NOPASSWD: /bin/systemctl reload apache2" | sudo tee -a /etc/sudoers.d/apache-reload
```

## 5. Firewall Configuration (if applicable)

```bash
# Allow HTTP and HTTPS traffic
sudo ufw allow 'Apache Full'
# or individually:
# sudo ufw allow 80
# sudo ufw allow 443
```

## 6. Testing the Setup

### Manual Test
1. Create a test file:
   ```bash
   mkdir -p /var/www/scorekeeper/releases/test
   echo "<h1>Test Deployment</h1>" > /var/www/scorekeeper/releases/test/index.html
   ln -sfn /var/www/scorekeeper/releases/test /var/www/scorekeeper/current
   ```

2. Visit your domain/IP to verify Apache is serving the content

### GitHub Actions Test
1. Commit and push changes to the main branch
2. Check GitHub Actions tab for workflow execution
3. Verify deployment by visiting your site

## 7. Post-Deployment Considerations

### SSL/HTTPS Setup (Recommended)
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-apache

# Obtain SSL certificate
sudo certbot --apache -d your-domain.com

# Auto-renewal is typically configured automatically
sudo certbot renew --dry-run
```

### Monitoring and Logs
- Apache logs: `/var/log/apache2/scorekeeper_*.log`
- GitHub Actions logs: Available in repository's Actions tab
- Deployment history: `/var/www/scorekeeper/releases/`

### Rollback Process
```bash
# List available releases
ls -la /var/www/scorekeeper/releases/

# Rollback to previous release
ln -sfn /var/www/scorekeeper/releases/PREVIOUS_TIMESTAMP /var/www/scorekeeper/current
sudo systemctl reload apache2
```

## Troubleshooting

### Common Issues
1. **Permission denied errors**: Check file ownership and permissions
2. **Apache not serving files**: Verify DocumentRoot and Directory configuration
3. **SSH connection failures**: Verify SSH key format and server access
4. **Deployment fails**: Check GitHub Actions logs and server logs

### Useful Commands
```bash
# Check Apache status
sudo systemctl status apache2

# Test Apache configuration
sudo apache2ctl configtest

# View recent deployments
ls -la /var/www/scorekeeper/releases/

# Check current deployment
ls -la /var/www/scorekeeper/current
```