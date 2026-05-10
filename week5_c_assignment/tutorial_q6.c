#include <stdio.h>

struct Book {
    int id;
    char title[50];
};

int main() {
    // Array of 3 structures initialized at declaration
    struct Book library[3] = {
        {1, "C Programming"},
        {2, "Data Structures"},
        {3, "Algorithms"}
    };
    
    printf("Library Catalog:\n");
    for(int i = 0; i < 3; i++) {
        printf("Book ID: %d, Title: %s\n", library[i].id, library[i].title);
    }
    
    return 0;
}
