#include <stdio.h>

struct Student {
    char name[50];
    int roll;
    float marks;
};

// Function prototypes
void readStudents(struct Student s[], int n);
void displayStudents(struct Student s[], int n);

int main() {
    struct Student students[10];
    
    // We pass the size '10' as per requirements
    printf("Enter details for 10 students:\n");
    readStudents(students, 10);
    
    printf("\n--- Student Information ---\n");
    displayStudents(students, 10);
    
    return 0;
}

void readStudents(struct Student s[], int n) {
    for(int i = 0; i < n; i++) {
        printf("Student %d:\n", i + 1);
        printf("Name: ");
        scanf(" %[^\n]s", s[i].name); // Reads string with spaces
        printf("Roll Number: ");
        scanf("%d", &s[i].roll);
        printf("Marks: ");
        scanf("%f", &s[i].marks);
    }
}

void displayStudents(struct Student s[], int n) {
    for(int i = 0; i < n; i++) {
        printf("Roll: %d | Name: %s | Marks: %.2f\n", s[i].roll, s[i].name, s[i].marks);
    }
}
