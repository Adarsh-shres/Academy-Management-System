#include <stdio.h>
#include <string.h>

struct Student {
    int roll;
    char name[50];
    char address[100];
    float mark;
};

int main() {
    struct Student s1;
    
    s1.roll = 1;
    strcpy(s1.name, "Alice Smith");
    strcpy(s1.address, "123 Main St, Springfield");
    s1.mark = 85.5;
    
    printf("Roll: %d\nName: %s\nAddress: %s\nMark: %.2f\n", 
           s1.roll, s1.name, s1.address, s1.mark);
           
    return 0;
}
