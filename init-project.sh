#!/bin/bash

# Exit immediately on errors
set -e

# 1. Delete previous .git folder
echo "🗑️ Removing existing .git directory..."
rm -rf .git

# 2. Prompt for new project name
read -p "📝 Enter new project name: " project_name

# 3. Prompt for new GitHub SSH URL
read -p "🔗 Enter new GitHub SSH repo SSH URL: " ssh_url

# 4. Update package.json name and repository URL (if package.json exists)
if [ -f "package.json" ]; then
    echo "🛠️ Updating package.json..."

    # Change "name": "old-name" to "name": "new-project-name"
    sed -i "s/\"name\":\s*\"[^\"]*\"/\"name\": \"$project_name\"/" package.json

    # Check if "repository" field exists
    if grep -q '"repository"' package.json; then
        # Update the existing "url" field under "repository"
        sed -i "s|\"url\":\s*\"[^\"]*\"|\"url\": \"$ssh_url\"|" package.json
    else
        # Insert repository field (after the first { )
        sed -i "0,/^{/{s/{/{\n  \"repository\": { \"type\": \"git\", \"url\": \"$ssh_url\" },/}" package.json
    fi
fi

# 5. Initialize Git
echo "🔃 Initializing new Git repo..."
git init
git remote add origin "$ssh_url"

# 6. Install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Running npm install..."
    npm install
fi

# 7. Make initial commit and force push
echo "✅ Making initial commit..."
git add .
git commit -m "Initial commit from template"
git branch -M main
git push -u origin main --force

echo "🚀 Project '$project_name' is ready and pushed to '$ssh_url'"
