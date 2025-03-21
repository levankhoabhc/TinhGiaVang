#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting GitHub Pages update process...${NC}"

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)

# Check if we're on main branch
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}Error: Please switch to main branch first${NC}"
    exit 1
fi

# Check if there are any uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}Error: You have uncommitted changes. Please commit or stash them first.${NC}"
    exit 1
fi

# Switch to gh-pages branch
echo -e "${BLUE}Switching to gh-pages branch...${NC}"
git checkout gh-pages

# Merge changes from main
echo -e "${BLUE}Merging changes from main...${NC}"
git merge main

# Push to GitHub
echo -e "${BLUE}Pushing changes to GitHub...${NC}"
git push origin gh-pages

# Switch back to main branch
echo -e "${BLUE}Switching back to main branch...${NC}"
git checkout main

echo -e "${GREEN}GitHub Pages update completed successfully!${NC}"
echo -e "${BLUE}Your site should be updated at: https://levankhoabhc.github.io/TinhGiaVang/${NC}" 