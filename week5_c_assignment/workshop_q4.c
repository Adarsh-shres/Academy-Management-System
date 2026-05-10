#include <stdio.h>

typedef struct {
    char name[50];
    float salary;
    int hoursPerDay;
} Employee;

int main() {
    Employee emps[5] = {
        {"Alice", 50000.0, 8},
        {"Bob", 60000.0, 10},
        {"Charlie", 45000.0, 12},
        {"Diana", 70000.0, 7},
        {"Eve", 55000.0, 14}
    };
    
    for (int i = 0; i < 5; i++) {
        if (emps[i].hoursPerDay >= 12) {
            emps[i].salary += 150;
        } else if (emps[i].hoursPerDay >= 10) {
            emps[i].salary += 100;
        } else if (emps[i].hoursPerDay == 8) {
            emps[i].salary += 50;
        }
    }
    
    printf("Updated Salaries:\n");
    for (int i = 0; i < 5; i++) {
        printf("%s: $%.2f (Hours: %d)\n", emps[i].name, emps[i].salary, emps[i].hoursPerDay);
    }
    
    return 0;
}
