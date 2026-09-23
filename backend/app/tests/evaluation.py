from app.services.router_ai import needs_web_search

test_cases = [
    {
        "query": "Who is Virat Kohli?",
        "expected": False,
    },
    {
        "query": "Latest AI news",
        "expected": True,
    },
    {
        "query": "Explain Java HashMap",
        "expected": False,
    },
    {
        "query": "Today's gold price",
        "expected": True,
    },
    {
        "query": "React useEffect hook",
        "expected": False,
    },
    {
        "query": "AP EAPCET counselling latest updates",
        "expected": True,
    },
    {
        "query": "Python list comprehension",
        "expected": False,
    },
    {
        "query": "Weather in Hyderabad",
        "expected": True,
    },
    {
        "query": "Difference between JDK and JRE",
        "expected": False,
    },
    {
        "query": "IPL points table",
        "expected": True,
    }
]


def run_tests():
    passed = 0
    failed = 0

    print("=" * 60)
    print("GARUDA ROUTER AI EVALUATION")
    print("=" * 60)

    for index, test in enumerate(test_cases, start=1):
        result = needs_web_search(test["query"])

        if result == test["expected"]:
            status = "PASS"
            passed += 1
        else:
            status = "FAIL"
            failed += 1

        print(f"\nTest {index}")
        print(f"Query     : {test['query']}")
        print(f"Expected  : {test['expected']}")
        print(f"Predicted : {result}")
        print(f"Status    : {status}")

    print("\n" + "=" * 60)
    print(f"Passed : {passed}")
    print(f"Failed : {failed}")
    print(f"Accuracy : {(passed/len(test_cases))*100:.2f}%")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()