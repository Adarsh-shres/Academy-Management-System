#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    
    printf("Enter the number of elements: ");
    if (scanf("%d", &n) != 1 || n <= 0) {
        printf("Invalid input.\n");
        return 1;
    }
    
    // Dynamically allocate first array
    int* arr1 = (int*)malloc(n * sizeof(int));
    if (arr1 == NULL) {
        printf("Memory allocation failed!\n");
        return 1;
    }
    
    printf("Enter %d numbers:\n", n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr1[i]);
    }
    
    // Dynamically allocate second array for reversed elements
    int* arr2 = (int*)malloc(n * sizeof(int));
    if (arr2 == NULL) {
        printf("Memory allocation failed!\n");
        free(arr1);
        return 1;
    }
    
    // Populate second array in reverse order
    for (int i = 0; i < n; i++) {
        arr2[i] = arr1[n - 1 - i];
    }
    
    // Print Original Array
    printf("\nOriginal Array: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", arr1[i]);
    }
    
    // Print Reversed Array
    printf("\nReversed Array: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", arr2[i]);
    }
    printf("\n");
    
    // Free both dynamically allocated arrays
    free(arr1);
    free(arr2);
    
    return 0;
}
