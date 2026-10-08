# Peach Tower Labs 
# Peach Tower Labs

## Project Clear – CrossFire NCR Application

Welcome to the Peach Tower Labs GitHub repository!

This repository contains our group's work for the CrossFire Non-Conformance Report (NCR) application.

## Team GitHub Instructions

These instructions explain how to download, edit, save, and upload your work to GitHub.

### 1. Clone the Repository (First Time on a Computer)

Open VS Code, open the terminal, and enter:

```bash
git clone https://github.com/estebonbon/peach-tower-labs.git
```

Move into the project folder:

```bash
cd peach-tower-labs
```

**Important:** If you're using a different school computer, you'll need to clone the repository again.

### 2. Get the Latest Changes

Before starting work, make sure you have the newest version of the project.

```bash
git switch main
git pull origin main
```

This downloads the latest changes from GitHub.

### 3. Create Your Own Branch

Each teammate should work on their own branch rather than directly on `main`.

```bash
git switch -c your-name-feature
```

Example:

```bash
git switch -c teamate-homepage
```

If your branch already exists on GitHub, use:

```bash
git fetch origin
git switch your-name-feature
```

### 4. Make Your Changes

Open the project files in VS Code.

- Add new files.
- Edit existing HTML, CSS, or JavaScript.
- Test your changes.
- Save your files using `Ctrl + S`.

### 5. Save Your Changes to Git

Open the terminal and run these commands:

**Check what changed:**

```bash
git status
```

**Prepare your files:**

```bash
git add .
```

**Commit your changes:**

```bash
git commit -m "Added homepage layout"
```

Replace the message with a short description of what you completed.

### 6. Push Your Work to GitHub

For a new branch:

```bash
git push -u origin your-name-feature
```

For later pushes on the same branch:

```bash
git push
```

**Important:** Always push your work before leaving a school computer. Otherwise, your commits may only exist on that computer.

### 7. Merge Your Changes into Main

Once your work is complete:

1. Open the repository on GitHub.
2. Select **Compare & pull request** for your branch.
3. Describe the changes you made.
4. Have another teammate review your work.
5. Merge the pull request into `main` once approved.

## Quick Git Command Reference

| Command | Description |
|---|---|
| `git clone URL` | Downloads the repository |
| `git pull` | Downloads and integrates changes |
| `git switch main` | Switches to the main branch |
| `git switch -c NAME` | Creates a new branch |
| `git status` | Shows changed files |
| `git add .` | Prepares changes |
| `git commit -m "message"` | Saves changes locally |
| `git push` | Uploads commits to GitHub |

## Team Rules

1. Always pull the latest version of `main` before starting a new task.
2. Use your own branch when developing a feature.
3. Write meaningful commit messages.
4. Do not push directly to `main`.
5. Communicate with teammates before editing shared files.
6. Always push your changes before leaving the school computer.
7. Confirm your changes appear on GitHub.
8. Sign out of GitHub on shared computers.

## Our Workflow

**Clone → Pull → Create Branch → Edit → Commit → Push → Pull Request → Merge**

Following these instructions will help us keep our project organized and avoid accidentally overwriting each other's work.