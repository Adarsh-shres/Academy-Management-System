#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

int* primes(int n) {
    if (n <= 0) return NULL;
    
    int* primeArray = (int*)malloc(n * sizeof(int));
    if (primeArray == NULL) return NULL;
    
    int count = 0;
    int num = 2; // First prime number
    
    while (count < n) {
        bool isPrime = true;
        for (int i = 2; i * i <= num; i++) {
            if (num % i == 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) {
            primeArray[count] = num;
            count++;
        }
        num++;
    }
    
    return primeArray;
}

int main() {
    int n = 5;
    int* p = primes(n);
    
    if (p != NULL) {
        printf("primes(%d) -> {", n);
        for (int i = 0; i < n; i++) {
            printf("%d%s", p[i], i < n - 1 ? ", " : "");
        }
        printf("}\n");
        free(p); // Free the memory!
    }
    
    return 0;
}
