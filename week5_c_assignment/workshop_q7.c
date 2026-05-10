#include <stdio.h>
#include <stdlib.h>

int* fibonacci(int size) {
    if (size <= 0) return NULL;
    
    // Allocate memory for 'size' integers
    int* fib = (int*)malloc(size * sizeof(int));
    if (fib == NULL) return NULL;
    
    if (size >= 1) fib[0] = 0;
    if (size >= 2) fib[1] = 1;
    
    for (int i = 2; i < size; i++) {
        fib[i] = fib[i-1] + fib[i-2];
    }
    
    return fib;
}

int main() {
    int size = 5;
    int* seq = fibonacci(size);
    
    if (seq != NULL) {
        printf("fibonacci(%d) -> {", size);
        for (int i = 0; i < size; i++) {
            printf("%d%s", seq[i], i < size - 1 ? ", " : "");
        }
        printf("}\n");
        free(seq); // Free the memory!
    }
    
    return 0;
}
