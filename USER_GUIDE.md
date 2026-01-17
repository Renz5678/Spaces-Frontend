# Spaces - User Guide

**A simple tool to explore the four fundamental subspaces of linear algebra**

---

## What is Spaces?

Spaces computes the **four fundamental subspaces** of any matrix:

1. **Column Space** - Linear combinations of the matrix columns
2. **Row Space** - Linear combinations of the matrix rows
3. **Null Space** - Vectors that get mapped to zero
4. **Left Null Space** - Null space of the transposed matrix

---

## Getting Started

### 1. Enter a Matrix

- **Set size**: Choose rows and columns (up to 5×5)
- **Fill values**: Click cells and type numbers
  - Integers: `5`, `-3`
  - Decimals: `0.5`, `-2.75`
  - Fractions: `1/2`, `-3/4`
- **Quick actions**:
  - **Clear** - Reset all cells
  - **Fill Zeros** - Fill empty cells with 0
  - **Load Example** - Try sample matrices

### 2. Compute

Click **"Compute Subspaces"** to calculate:
- Row-Reduced Echelon Form (RREF)
- Matrix rank
- All four fundamental subspaces
- Basis vectors for each subspace

### 3. View Results

Results show:
- **Matrix dimensions and rank**
- **RREF** with pivot columns highlighted
- **Dimension Theorem** verification (rank + nullity = columns)
- **Four subspace cards** with basis vectors

### 4. Visualize (Optional)

For 2D and 3D matrices, click **"Visualize Basis Vectors"**:
- **2D**: Arrows on a coordinate plane
- **3D**: Interactive scene (drag to rotate, scroll to zoom)

---

## User Accounts (Optional)

### Why Create an Account?

Save your matrices to the cloud and access them from any device.

### Sign Up

1. Click **"Sign Up"** in the header
2. Enter your email and create a password
3. Check your email for verification (if required)
4. Log in with your credentials

### Saving Matrices

1. Compute a matrix
2. Click **"Save Matrix"** in the results
3. Give it a name
4. Access it later from **"Saved Matrices"** page

### Managing Saved Matrices

- **View all**: Click "Saved Matrices" in the header
- **Load**: Click on any saved matrix to load it
- **Delete**: Click the delete button on any saved matrix

---

## Tips & Tricks

### Input
- Press **Tab** to move between cells
- Use fractions (`1/2`) for exact values
- Leave cells blank for zeros

### Understanding Results
- **Rank** = number of linearly independent rows/columns
- **Dimension 0** = "Trivial" (only the zero vector)
- **Dimension Theorem**: rank + nullity = number of columns

### Visualization
- Only works for 2×2 and 3×3 matrices
- Each subspace has its own color
- Use the legend to identify subspaces

---

## Troubleshooting

**"Invalid number" error**
- Check for typos in fractions (e.g., `1/0` is invalid)
- Ensure decimals are formatted correctly

**Visualization not showing**
- Only available for 2×2 and 3×3 matrices
- Make sure computation completed successfully

**Saved matrices not appearing**
- You need to be logged in
- Check your internet connection

---

## Examples to Try

### Identity Matrix (Full Rank)
```
[1  0  0]
[0  1  0]
[0  0  1]
```
Rank: 3, Column space: all of ℝ³, Null space: trivial

### Rank-Deficient Matrix
```
[1  2  3]
[2  4  6]
[3  6  9]
```
Rank: 1, Large null space, interesting visualization

---
