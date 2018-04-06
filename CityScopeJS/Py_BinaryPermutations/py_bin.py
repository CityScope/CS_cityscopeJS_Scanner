''' 
Calculates the number of optional iterations for 0,1 over a list of 16. 
converts these into matrix of 4x4, and lastly [super slow] check for 'push' duplications, 
eg:  given: 1234[2341, 3412, 4123] are considered duplicates  
'''
import math
import itertools
import numpy as np

i = 0
length = 16
shapeAsMatrix = []

allOptions = list(itertools.product([0, 1], repeat=length))
for option in allOptions:
    shapeAsMatrix.append(np.array(option).reshape(4, 4))

for option in allOptions:
    for testOption in allOptions:
        print('testing', option)

        if (option == np.roll(testOption, 4)).all() or (option == np.roll(testOption, 8)).all() or (option == np.roll(testOption, 12)).all():
            print('\n', 'found', testOption, '\n')
    i += 1
