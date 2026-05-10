#include <stdio.h>

typedef struct {
    float x;
    float y;
} Point;

// Function returns a struct by value
Point calculateMidpoint(Point p1, Point p2) {
    Point mid;
    mid.x = (p1.x + p2.x) / 2.0f;
    mid.y = (p1.y + p2.y) / 2.0f;
    return mid;
}

int main() {
    Point p1, p2, mid;
    
    printf("Enter X and Y for Point 1 (e.g. 2 4): ");
    scanf("%f %f", &p1.x, &p1.y);
    
    printf("Enter X and Y for Point 2 (e.g. 6 8): ");
    scanf("%f %f", &p2.x, &p2.y);
    
    mid = calculateMidpoint(p1, p2);
    
    printf("The midpoint is: (%.2f, %.2f)\n", mid.x, mid.y);
    
    return 0;
}
