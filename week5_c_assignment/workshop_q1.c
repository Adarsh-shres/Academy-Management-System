#include <stdio.h>

#define PI 3.14159265359

typedef struct {
    float area;
    float perimeter;
} CircleMetrics;

CircleMetrics calculateCircle(float radius) {
    CircleMetrics metrics;
    metrics.area = PI * radius * radius;
    metrics.perimeter = 2 * PI * radius;
    return metrics;
}

int main() {
    float r = 5.0;
    CircleMetrics result = calculateCircle(r);
    
    printf("Radius: %.2f\n", r);
    printf("Area: %.2f\n", result.area);
    printf("Perimeter: %.2f\n", result.perimeter);
    
    return 0;
}
