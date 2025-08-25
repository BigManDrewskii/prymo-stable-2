#!/bin/bash

# PRYMO Production Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="prymo"
BUILD_DIR="dist"
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    log_success "All dependencies are available"
}

# Validate environment
validate_environment() {
    log_info "Validating environment..."
    
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    if [ ! -f ".env.production" ]; then
        log_warning ".env.production not found. Using default configuration."
    fi
    
    log_success "Environment validation complete"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    npm ci --only=production
    log_success "Dependencies installed"
}

# Run tests (if available)
run_tests() {
    log_info "Running tests..."
    if npm run test --if-present; then
        log_success "Tests passed"
    else
        log_warning "No tests found or tests failed"
    fi
}

# Build the application
build_application() {
    log_info "Building application for production..."
    
    # Clean previous build
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        log_info "Cleaned previous build"
    fi
    
    # Build
    npm run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build failed - $BUILD_DIR directory not created"
        exit 1
    fi
    
    log_success "Application built successfully"
}

# Validate build
validate_build() {
    log_info "Validating build..."
    
    # Check if essential files exist
    if [ ! -f "$BUILD_DIR/index.html" ]; then
        log_error "index.html not found in build"
        exit 1
    fi
    
    # Check build size
    BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
    log_info "Build size: $BUILD_SIZE"
    
    log_success "Build validation complete"
}

# Create backup (if deploying to existing server)
create_backup() {
    if [ "$1" = "--backup" ] && [ -d "/var/www/$PROJECT_NAME" ]; then
        log_info "Creating backup..."
        mkdir -p "$BACKUP_DIR"
        tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "/var/www" "$PROJECT_NAME"
        log_success "Backup created: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
    fi
}

# Deploy to different platforms
deploy_vercel() {
    log_info "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI not installed. Install with: npm i -g vercel"
        exit 1
    fi
    
    vercel --prod
    log_success "Deployed to Vercel"
}

deploy_netlify() {
    log_info "Deploying to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        log_error "Netlify CLI not installed. Install with: npm i -g netlify-cli"
        exit 1
    fi
    
    netlify deploy --prod --dir="$BUILD_DIR"
    log_success "Deployed to Netlify"
}

deploy_docker() {
    log_info "Building Docker image..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker not installed"
        exit 1
    fi
    
    docker build -t "$PROJECT_NAME:$TIMESTAMP" .
    docker tag "$PROJECT_NAME:$TIMESTAMP" "$PROJECT_NAME:latest"
    
    log_success "Docker image built: $PROJECT_NAME:$TIMESTAMP"
    log_info "To run: docker run -p 80:80 $PROJECT_NAME:latest"
}

deploy_static() {
    local target_dir="${1:-/var/www/$PROJECT_NAME}"
    
    log_info "Deploying to static directory: $target_dir"
    
    # Create target directory if it doesn't exist
    sudo mkdir -p "$target_dir"
    
    # Copy build files
    sudo cp -r "$BUILD_DIR"/* "$target_dir/"
    
    # Set proper permissions
    sudo chown -R www-data:www-data "$target_dir"
    sudo chmod -R 755 "$target_dir"
    
    log_success "Deployed to $target_dir"
}

# Main deployment function
main() {
    log_info "Starting PRYMO deployment..."
    log_info "Timestamp: $TIMESTAMP"
    
    # Parse arguments
    PLATFORM=""
    BACKUP=false
    TARGET_DIR=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --platform)
                PLATFORM="$2"
                shift 2
                ;;
            --backup)
                BACKUP=true
                shift
                ;;
            --target-dir)
                TARGET_DIR="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --platform PLATFORM    Deploy to specific platform (vercel|netlify|docker|static)"
                echo "  --backup               Create backup before deployment"
                echo "  --target-dir DIR       Target directory for static deployment"
                echo "  --help                 Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_dependencies
    validate_environment
    install_dependencies
    run_tests
    build_application
    validate_build
    
    # Create backup if requested
    if [ "$BACKUP" = true ]; then
        create_backup --backup
    fi
    
    # Deploy based on platform
    case $PLATFORM in
        vercel)
            deploy_vercel
            ;;
        netlify)
            deploy_netlify
            ;;
        docker)
            deploy_docker
            ;;
        static)
            deploy_static "$TARGET_DIR"
            ;;
        "")
            log_info "No platform specified. Build completed successfully."
            log_info "Build available in: $BUILD_DIR"
            log_info "To deploy, run with --platform option"
            ;;
        *)
            log_error "Unknown platform: $PLATFORM"
            log_info "Supported platforms: vercel, netlify, docker, static"
            exit 1
            ;;
    esac
    
    log_success "Deployment completed successfully!"
    log_info "Build timestamp: $TIMESTAMP"
}

# Run main function with all arguments
main "$@"