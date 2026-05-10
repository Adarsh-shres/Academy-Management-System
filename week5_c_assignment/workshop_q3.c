#include <stdio.h>
#include <stdlib.h>
#include <math.h>

float* findRootsPtr(int a, int b, int c) {
    float discriminant = (b * b) - (4 * a * c);
    
    if (discriminant < 0) {
        return NULL; // Return NULL for complex roots
    }
    
    // Dynamically allocate memory for 2 floats
    float* roots = (float*)malloc(2 * sizeof(float));
    if (roots == NULL) {
        return NULL; // Allocation failed
    }
    
    roots[0] = (-b + sqrt(discriminant)) / (2.0f * a);
    roots[1] = (-b - sqrt(discriminant)) / (2.0f * a);
    
    return roots;
}

int main() {
    int a = 1, b = -5, c = 6; // Equation: x^2 - 5x + 6 = 0
    
    float* roots = findRootsPtr(a, b, c);
    
    if (roots != NULL) {
        printf("Roots: %.2f and %.2f\n", roots[0], roots[1]);
        free(roots); // Crucial: free dynamically allocated memory!
    } else {
        printf("Roots are complex or memory allocation failed.\n");
    }
    
    return 0;
}
