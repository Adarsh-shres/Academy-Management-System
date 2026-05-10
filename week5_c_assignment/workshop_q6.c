#include <stdio.h>
#include <string.h>

#define MAX_BOOKS 100

typedef struct {
    int accessionNumber;
    char author[50];
    char title[100];
    int isIssued; // 1 = Issued, 0 = Available
} Book;

int main() {
    Book library[MAX_BOOKS];
    int bookCount = 0;
    int choice;
    
    do {
        printf("\n--- Library Menu ---\n");
        printf("1. Display book information\n");
        printf("2. Add a new book\n");
        printf("3. Display all books by a particular author\n");
        printf("4. Display number of books with a particular title\n");
        printf("5. Display total number of books\n");
        printf("6. Issue a book\n");
        printf("0. Exit\n");
        printf("Enter choice: ");
        if(scanf("%d", &choice) != 1) {
            // clear buffer if invalid input
            while(getchar() != '\n');
            continue;
        }
        
        switch (choice) {
            case 1:
                printf("\n--- Book Database ---\n");
                for(int i = 0; i < bookCount; i++) {
                    printf("Acc#: %d | Title: '%s' | Author: %s | Status: %s\n", 
                           library[i].accessionNumber, library[i].title, library[i].author, 
                           library[i].isIssued ? "Issued" : "Available");
                }
                break;
            case 2:
                if (bookCount < MAX_BOOKS) {
                    printf("Enter Accession Number: ");
                    scanf("%d", &library[bookCount].accessionNumber);
                    printf("Enter Title: ");
                    scanf(" %[^\n]s", library[bookCount].title);
                    printf("Enter Author: ");
                    scanf(" %[^\n]s", library[bookCount].author);
                    library[bookCount].isIssued = 0;
                    bookCount++;
                    printf("Book added successfully!\n");
                } else {
                    printf("Library is full!\n");
                }
                break;
            case 3: {
                char searchAuthor[50];
                printf("Enter Author Name: ");
                scanf(" %[^\n]s", searchAuthor);
                printf("\nBooks by %s:\n", searchAuthor);
                for(int i = 0; i < bookCount; i++) {
                    if (strcmp(library[i].author, searchAuthor) == 0) {
                        printf("- %s (Acc#: %d)\n", library[i].title, library[i].accessionNumber);
                    }
                }
                break;
            }
            case 4: {
                char searchTitle[100];
                int count = 0;
                printf("Enter Book Title: ");
                scanf(" %[^\n]s", searchTitle);
                for(int i = 0; i < bookCount; i++) {
                    if (strcmp(library[i].title, searchTitle) == 0) count++;
                }
                printf("Number of books with title '%s': %d\n", searchTitle, count);
                break;
            }
            case 5:
                printf("Total number of books in library: %d\n", bookCount);
                break;
            case 6: {
                int accNum, found = 0;
                printf("Enter Accession Number to issue: ");
                scanf("%d", &accNum);
                for(int i = 0; i < bookCount; i++) {
                    if (library[i].accessionNumber == accNum) {
                        found = 1;
                        if (library[i].isIssued) {
                            printf("Book is already issued.\n");
                        } else {
                            library[i].isIssued = 1;
                            printf("Book issued successfully.\n");
                        }
                        break;
                    }
                }
                if (!found) printf("Book not found.\n");
                break;
            }
            case 0:
                printf("Exiting system.\n");
                break;
            default:
                printf("Invalid choice. Try again.\n");
        }
    } while(choice != 0);
    
    return 0;
}
