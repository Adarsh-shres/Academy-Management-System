#include <stdio.h>

typedef struct {
    char name[50];
    float salary;
    int hoursPerDay;
} Employee;

// Function takes a pointer to an Employee struct
void updateSalary(Employee* emp) {
    if (emp->hoursPerDay >= 12) {
        emp->salary += 150;
    } else if (emp->hoursPerDay >= 10) {
        emp->salary += 100;
    } else if (emp->hoursPerDay == 8) {
        emp->salary += 50;
    }
}

int main() {
    Employee emps[5] = {
        {"Alice", 50000.0, 8},
        {"Bob", 60000.0, 10},
        {"Charlie", 45000.0, 12},
        {"Diana", 70000.0, 7},
        {"Eve", 55000.0, 14}
    };
    
    for (int i = 0; i < 5; i++) {
        updateSalary(&emps[i]); // Pass the address of the struct
    }
    
    printf("Updated Salaries (Via Pointers):\n");
    for (int i = 0; i < 5; i++) {
        printf("%s: $%.2f\n", emps[i].name, emps[i].salary);
    }
    
    return 0;
}
