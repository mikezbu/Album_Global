arr = [9,24,67,2,2,5,12]

def merge_sort(arr):
    if len(arr) > 1:
        left_arr = arr[:len(arr)//2]
        right_arr = arr[len(arr)//2:]

        merge_sort(left_arr)
        merge_sort(right_arr)

        # now, merge sorts are completely separated, then merge
        # compare the first index of one 

        #these track indices
        i = 0 # left most array index
        j = 0 # right most array index
        k = 0 # merged array index

        while i < len(left_arr) and j < len(right_arr):

            if left_arr[i] < right_arr[j]: 
                arr[k] = left_arr[i]
                i += 1
                k += 1
            
            else:
                arr[k] = right_arr[j]
                j += 1
                k += 1

        while i < len(left_arr):
            arr[k] = left_arr[i]
            i += 1
            k += 1

        while j < len(right_arr):
            arr[k] = right_arr[j]
            j += 1
            k += 1

