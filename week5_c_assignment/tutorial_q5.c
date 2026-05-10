#include <stdio.h>
#include <string.h>

struct Address {
    char province[50];
    char district[50];
    char city[50];
    int ward;
};

struct Student {
    int roll;
    char name[50];
    struct Address address;
    float mark;
};

int main() {
    struct Student s1;
    
    s1.roll = 2;
    strcpy(s1.name, "Bob Jones");
    
    // Accessing nested structure members
    strcpy(s1.address.province, "Bagmati");
    strcpy(s1.address.district, "Kathmandu");
    strcpy(s1.address.city, "Kathmandu");
    s1.address.ward = 10;
    s1.mark = 92.0;
    
    printf("Name: %s\n", s1.name);
    printf("Address: Ward %d, %s, %s, %s\n", 
           s1.address.ward, s1.address.city, 
           s1.address.district, s1.address.province);
           
    return 0;
}
