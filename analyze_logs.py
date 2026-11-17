from collections import Counter

with open("ecommerce.log", "r") as file:
    logs = file.readlines()

errors = [line.strip() for line in logs if "ERROR" in line]
warnings = [line.strip() for line in logs if "WARNING" in line]

print("\n===== E-COMMERCE LOG MONITOR =====")
print("Total log entries:", len(logs))
print("Total errors:", len(errors))
print("Total warnings:", len(warnings))

print("\n===== ERROR DETAILS =====")
for error in errors:
    print(error)

print("\n===== ERROR SUMMARY =====")
summary = Counter(
    "Payment gateway timeout"
    if "Payment gateway timeout" in error
    else "Database connection failed"
    if "Database connection failed" in error
    else "Other error"
    for error in errors
)

for error_type, count in summary.items():
    print(f"{error_type}: {count}")
