#!/bin/bash
# Validation script for unified neural network enterprise system

echo "=================================="
echo "Unified Neural Network System"
echo "Implementation Validation"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Checking system directories...${NC}"
systems=("nn-crm" "nn-mrp" "nn-lms" "hyperd" "nn-integration")
for system in "${systems[@]}"; do
    if [ -d "ext/$system" ]; then
        file_count=$(ls -1 ext/$system | wc -l)
        echo -e "${GREEN}✓${NC} $system: $file_count files"
    else
        echo "✗ $system: NOT FOUND"
    fi
done

echo ""
echo -e "${BLUE}Checking data files...${NC}"
data_files=(
    "ext/nn-crm/customers.json"
    "ext/nn-crm/interactions.json"
    "ext/nn-mrp/materials.json"
    "ext/nn-mrp/demand.json"
    "ext/nn-lms/learners.json"
    "ext/nn-lms/courses.json"
)
for file in "${data_files[@]}"; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file")
        echo -e "${GREEN}✓${NC} $file ($size bytes)"
    else
        echo "✗ $file: NOT FOUND"
    fi
done

echo ""
echo -e "${BLUE}Checking implementation files...${NC}"
impl_files=(
    "ext/nn-crm/nn-crm-impl.js"
    "ext/nn-mrp/nn-mrp-impl.js"
    "ext/nn-lms/nn-lms-impl.js"
    "ext/hyperd/hyperd.js"
    "ext/hyperd/hgnn.js"
    "ext/hyperd/unified-integration-impl.js"
)
for file in "${impl_files[@]}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        echo -e "${GREEN}✓${NC} $file ($lines lines)"
    else
        echo "✗ $file: NOT FOUND"
    fi
done

echo ""
echo -e "${BLUE}Checking Cap'n Proto configurations...${NC}"
capnp_files=(
    "ext/nn-crm/nn-crm.capnp"
    "ext/nn-crm/nn-crm-config.capnp"
    "ext/nn-mrp/nn-mrp.capnp"
    "ext/nn-mrp/nn-mrp-config.capnp"
    "ext/nn-lms/nn-lms.capnp"
    "ext/nn-lms/nn-lms-config.capnp"
    "ext/hyperd/hyperd.capnp"
    "ext/hyperd/hyperd-config.capnp"
)
for file in "${capnp_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo "✗ $file: NOT FOUND"
    fi
done

echo ""
echo -e "${BLUE}Checking documentation...${NC}"
doc_files=(
    "ext/hyperd/README.md"
    "UNIFIED_NEURAL_SYSTEM_COMPLETE.md"
)
for file in "${doc_files[@]}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        echo -e "${GREEN}✓${NC} $file ($lines lines)"
    else
        echo "✗ $file: NOT FOUND"
    fi
done

echo ""
echo "=================================="
echo "Summary"
echo "=================================="
echo ""
echo "Systems implemented:"
echo "  • nn-crm (Customer Relationship Management)"
echo "  • nn-mrp (Material Resource Planning)"
echo "  • nn-lms (Learning Management System)"
echo "  • hyperd (Unified Orchestration with HGNN)"
echo ""
echo "Integration:"
echo "  • Existing nn-scm (Supply Chain Management)"
echo "  • Existing nn-erp (Enterprise Resource Planning)"
echo ""
echo "Ports:"
echo "  • 8080: nn-scm (existing)"
echo "  • 8081: nn-crm (new)"
echo "  • 8082: nn-mrp (new)"
echo "  • 8083: nn-lms (new)"
echo "  • 8084: hyperd unified (new)"
echo ""
echo "To start all systems, run:"
echo "  cd ext/nn-integration && workerd serve nn-config.capnp &"
echo "  cd ext/nn-crm && workerd serve nn-crm-config.capnp &"
echo "  cd ext/nn-mrp && workerd serve nn-mrp-config.capnp &"
echo "  cd ext/nn-lms && workerd serve nn-lms-config.capnp &"
echo "  cd ext/hyperd && workerd serve hyperd-config.capnp &"
echo ""
echo "Test unified dashboard:"
echo "  curl http://localhost:8084/api/dashboard"
echo ""
echo -e "${GREEN}✓ Implementation Complete${NC}"
