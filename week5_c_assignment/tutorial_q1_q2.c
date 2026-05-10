#include <stdio.h>

// 1. Create a user-defined datatype using struct
struct Point {
    int x;
    int y;
};

int main() {
    // 2. Create a structure variable
    struct Point p1;
    
    // Assign values
    p1.x = 10;
    p1.y = 20;

    printf("Point coordinates: (%d, %d)\n", p1.x, p1.y);
    return 0;
}
