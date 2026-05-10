#include <stdio.h>

// Using typedef with struct to avoid typing 'struct' every time
typedef struct {
    int id;
    float salary;
} Employee;

int main() {
    // We can use 'Employee' directly
    Employee emp1 = {101, 55000.50};
    
    // typedef with primitive types for convenience
    typedef unsigned long ulong;
    ulong count = 1000000;
    
    printf("Employee ID: %d, Salary: $%.2f\n", emp1.id, emp1.salary);
    printf("Count: %lu\n", count);
    return 0;
}
