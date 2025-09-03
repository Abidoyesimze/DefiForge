# Security Guidelines for DefiForge

## 🔒 **Credential Management**

### **Never Commit Credentials to Git**
- **Private Keys**: Never commit private keys to version control
- **API Keys**: Never commit API keys to version control
- **Environment Files**: Never commit `.env` files to version control

### **Environment Variables**
All sensitive data should be stored in environment variables:

#### **Hardhat (.env)**
```bash
# Required for deployment
SOMNIA_PRIVATE_KEY=your_private_key_here
ETN_PRIVATE_KEY=your_private_key_here

# Optional API keys
ALCHEMY_API_KEY=your_alchemy_key_here
ETHERSCAN_MAINNET_API_KEY=your_etherscan_key_here
BASESCAN_API_KEY=your_basescan_key_here
```

#### **Next.js (.env.local)**
```bash
# Public API keys (will be exposed to browser)
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key_here
```

### **File Structure**
```
packages/
├── hardhat/
│   ├── .env.example          # Template for environment variables
│   ├── .env                  # Your actual environment variables (NOT committed)
│   └── hardhat.config.ts     # Uses process.env.* for all sensitive data
└── nextjs/
    ├── .env.example          # Template for environment variables
    ├── .env.local            # Your actual environment variables (NOT committed)
    └── scaffold.config.ts    # Uses process.env.* for all sensitive data
```

### **Git Safety**
- `.env` files are already in `.gitignore`
- Use `.env.example` files as templates
- Always verify no credentials are in committed files

### **If Credentials Are Exposed**
1. **Immediately revoke** the exposed credentials
2. **Generate new** credentials
3. **Update** your local `.env` files
4. **Check** git history for any other exposed data
5. **Consider** the security implications of the exposure

### **Best Practices**
- Use different API keys for development and production
- Rotate API keys regularly
- Use environment-specific configuration files
- Never log or print sensitive data
- Use secret management services in production

## 🚨 **Emergency Response**

If you discover credentials have been committed:
1. **Don't panic** - act quickly but carefully
2. **Revoke immediately** - contact the service provider
3. **Generate new keys** - create fresh credentials
4. **Update documentation** - ensure team knows the new process
5. **Review security** - implement additional safeguards

## 📞 **Support**

For security concerns or questions about credential management, please contact the development team immediately. 