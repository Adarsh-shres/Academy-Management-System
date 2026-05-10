#include <stdio.h>
#include <math.h>

typedef struct {
    float root1;
    float root2;
    int hasRealRoots; // 1 if real, 0 if complex
} QuadraticRoots;

QuadraticRoots findRoots(int a, int b, int c) {
    QuadraticRoots result;
    float discriminant = (b * b) - (4 * a * c);
    
    if (discriminant >= 0) {
        result.hasRealRoots = 1;
        result.root1 = (-b + sqrt(discriminant)) / (2.0f * a);
        result.root2 = (-b - sqrt(discriminant)) / (2.0f * a);
    } else {
        result.hasRealRoots = 0;
    }
    
    return result;
}

int main() {
    int a = 1, b = -3, c = 2; // Equation: x^2 - 3x + 2 = 0
    
    QuadraticRoots r = findRoots(a, b, c);
    
    if (r.hasRealRoots) {
        printf("Roots are real: %.2f and %.2f\n", r.root1, r.root2);
    } else {
        printf("Roots are complex.\n");
    }
    
    return 0;
}
