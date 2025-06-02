# import matplotlib.pyplot as plt

# # Time in seconds
# reading_time = 34288
# processing_time = 23.6

# # Calculate the difference in time
# time_difference = reading_time - processing_time

# # Create horizontal bar plot
# labels = ['Reading Time', 'Processing Time']
# times = [reading_time, processing_time]

# plt.barh(labels, times, color=['blue', 'orange'])
# plt.xlabel('Time (seconds)')
# plt.title('Time Taken to Read and Process Document')
# plt.text(reading_time, 0, str(reading_time), ha='left', va='center')
# plt.text(processing_time, 1, str(processing_time), ha='left', va='center')
# plt.show()

# # Print the time difference
# print("Time difference between reading and processing:", time_difference, "seconds")
import matplotlib.pyplot as plt

# Time in seconds
# import matplotlib.pyplot as plt

# # Time in seconds
# human_reading_time = 136016 / 200 * 60  # Convert minutes to seconds
# system_answer_retrieval_time = 13.4

# # Assuming time for human to find answer is half the reading time
# human_finding_time = human_reading_time / 2

# # Create bar plot
# labels = ['Human Finding Time', 'System Answer Retrieval Time']
# times = [human_finding_time, system_answer_retrieval_time]

# plt.bar(labels, times, color=['blue', 'orange'])
# plt.ylabel('Time (seconds)')
# plt.title('Time Taken for Human Finding vs. System Answer Retrieval')
# plt.text(0, human_finding_time, str(round(human_finding_time, 2)), ha='center', va='bottom')
# plt.text(1, system_answer_retrieval_time, str(system_answer_retrieval_time), ha='center', va='bottom')
# plt.show()

# # Print the time difference
# time_difference = human_finding_time - system_answer_retrieval_time
# print("Time difference between human finding and system answer retrieval:", round(time_difference, 2), "seconds")
import matplotlib.pyplot as plt

# Data
categories = ['Human', 'GPT', 'Gemini']
times = [20402.4, 19, 13]  # Time in seconds

# Plotting
plt.figure(figsize=(10, 6))
bars = plt.bar(categories, times, color=['orange', 'blue', 'green'])

# Adding the values on the bars
for bar, time in zip(bars, times):
    plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height(), str(time), ha='center', va='bottom')

plt.title('Performance Comparison: Human vs GPT vs Gemini')
plt.ylabel('Time (seconds)')
plt.show()
