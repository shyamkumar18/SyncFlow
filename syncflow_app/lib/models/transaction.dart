class Transaction {
  final String id;
  final String? userId;
  final String? emailId;
  final double amount;
  final String currency;
  final String type;
  final String date;
  final String? time;
  final String? description;
  final String? merchant;
  final String? merchantRaw;
  final String? sender;
  final String? receiver;
  final double? balance;
  final String? upiId;
  final String? referenceNumber;
  final String bank;
  final String? cardType;
  final String? cardNumber;
  final String status;
  final String? autoCategory;
  final CategoryRef? category;
  final double? categoryConfidence;
  final List<String> tags;
  final String? notes;
  final bool isRecurring;
  final bool isManual;
  final bool normalized;
  final String createdAt;
  final String updatedAt;

  Transaction({
    required this.id,
    this.userId,
    this.emailId,
    required this.amount,
    this.currency = 'INR',
    required this.type,
    required this.date,
    this.time,
    this.description,
    this.merchant,
    this.merchantRaw,
    this.sender,
    this.receiver,
    this.balance,
    this.upiId,
    this.referenceNumber,
    required this.bank,
    this.cardType,
    this.cardNumber,
    this.status = 'success',
    this.autoCategory,
    this.category,
    this.categoryConfidence,
    this.tags = const [],
    this.notes,
    this.isRecurring = false,
    this.isManual = false,
    this.normalized = false,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['_id'] as String? ?? '',
      userId: json['userId'] as String?,
      emailId: json['emailId'] as String?,
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      currency: json['currency'] as String? ?? 'INR',
      type: json['type'] as String? ?? 'debit',
      date: json['date'] as String? ?? '',
      time: json['time'] as String?,
      description: json['description'] as String?,
      merchant: json['merchant'] as String?,
      merchantRaw: json['merchantRaw'] as String?,
      sender: json['sender'] as String?,
      receiver: json['receiver'] as String?,
      balance: (json['balance'] as num?)?.toDouble(),
      upiId: json['upiId'] as String?,
      referenceNumber: json['referenceNumber'] as String?,
      bank: json['bank'] as String? ?? '',
      cardType: json['cardType'] as String?,
      cardNumber: json['cardNumber'] as String?,
      status: json['status'] as String? ?? 'success',
      autoCategory: json['autoCategory'] as String?,
      category: json['category'] != null
          ? CategoryRef.fromJson(json['category'] as Map<String, dynamic>)
          : null,
      categoryConfidence: (json['categoryConfidence'] as num?)?.toDouble(),
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      notes: json['notes'] as String?,
      isRecurring: json['isRecurring'] as bool? ?? false,
      isManual: json['isManual'] as bool? ?? false,
      normalized: json['normalized'] as bool? ?? false,
      createdAt: json['createdAt'] as String? ?? '',
      updatedAt: json['updatedAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toCreateJson() {
    return {
      'amount': amount,
      'type': type,
      'date': date,
      if (time != null) 'time': time,
      if (description != null) 'description': description,
      if (merchant != null) 'merchant': merchant,
      if (sender != null) 'sender': sender,
      if (receiver != null) 'receiver': receiver,
      if (balance != null) 'balance': balance,
      if (upiId != null) 'upiId': upiId,
      if (referenceNumber != null) 'referenceNumber': referenceNumber,
      'bank': bank,
      if (cardType != null) 'cardType': cardType,
      if (status != 'success') 'status': status,
      if (category?.id != null) 'category': category!.id,
      if (tags.isNotEmpty) 'tags': tags,
      if (notes != null) 'notes': notes,
    };
  }

  bool get isCredit => type == 'credit';
  bool get isDebit => type == 'debit';
}

class CategoryRef {
  final String id;
  final String? name;
  final String? icon;
  final String? color;

  CategoryRef({
    required this.id,
    this.name,
    this.icon,
    this.color,
  });

  factory CategoryRef.fromJson(Map<String, dynamic> json) {
    return CategoryRef(
      id: json['_id'] as String? ?? '',
      name: json['name'] as String?,
      icon: json['icon'] as String?,
      color: json['color'] as String?,
    );
  }
}

class TransactionSummary {
  final double totalIncome;
  final double totalExpense;
  final double net;
  final double yearIncome;
  final double yearExpense;
  final double yearSavings;
  final double monthlyIncome;
  final List<CashFlowItem> cashFlow;
  final List<Transaction> recentTransactions;

  TransactionSummary({
    this.totalIncome = 0,
    this.totalExpense = 0,
    this.net = 0,
    this.yearIncome = 0,
    this.yearExpense = 0,
    this.yearSavings = 0,
    this.monthlyIncome = 0,
    this.cashFlow = const [],
    this.recentTransactions = const [],
  });

  factory TransactionSummary.fromJson(Map<String, dynamic> json) {
    return TransactionSummary(
      totalIncome: (json['totalIncome'] as num?)?.toDouble() ?? 0,
      totalExpense: (json['totalExpense'] as num?)?.toDouble() ?? 0,
      net: (json['net'] as num?)?.toDouble() ?? 0,
      yearIncome: (json['yearIncome'] as num?)?.toDouble() ?? 0,
      yearExpense: (json['yearExpense'] as num?)?.toDouble() ?? 0,
      yearSavings: (json['yearSavings'] as num?)?.toDouble() ?? 0,
      monthlyIncome: (json['monthlyIncome'] as num?)?.toDouble() ?? 0,
      cashFlow: (json['cashFlow'] as List<dynamic>?)
              ?.map((e) => CashFlowItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      recentTransactions: (json['recentTransactions'] as List<dynamic>?)
              ?.map((e) => Transaction.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class CashFlowItem {
  final int month;
  final int year;
  final double income;
  final double expense;
  final double net;

  CashFlowItem({
    required this.month,
    required this.year,
    this.income = 0,
    this.expense = 0,
    this.net = 0,
  });

  factory CashFlowItem.fromJson(Map<String, dynamic> json) {
    return CashFlowItem(
      month: json['month'] as int? ?? 1,
      year: json['year'] as int? ?? DateTime.now().year,
      income: (json['income'] as num?)?.toDouble() ?? 0,
      expense: (json['expense'] as num?)?.toDouble() ?? 0,
      net: (json['net'] as num?)?.toDouble() ?? 0,
    );
  }
}

class YearlyOverview {
  final int year;
  final double totalIncome;
  final double totalExpense;
  final double netSavings;
  final int totalTransactions;
  final Map<String, dynamic>? bestMonth;
  final Map<String, dynamic>? worstMonth;
  final Map<String, dynamic>? highestIncomeMonth;
  final Map<String, dynamic>? highestExpenseMonth;
  final double avgMonthlySpend;
  final double avgDaily;
  final int monthsWithData;
  final List<MonthlyData> monthly;

  YearlyOverview({
    required this.year,
    this.totalIncome = 0,
    this.totalExpense = 0,
    this.netSavings = 0,
    this.totalTransactions = 0,
    this.bestMonth,
    this.worstMonth,
    this.highestIncomeMonth,
    this.highestExpenseMonth,
    this.avgMonthlySpend = 0,
    this.avgDaily = 0,
    this.monthsWithData = 0,
    this.monthly = const [],
  });

  factory YearlyOverview.fromJson(Map<String, dynamic> json) {
    return YearlyOverview(
      year: json['year'] as int? ?? DateTime.now().year,
      totalIncome: (json['totalIncome'] as num?)?.toDouble() ?? 0,
      totalExpense: (json['totalExpense'] as num?)?.toDouble() ?? 0,
      netSavings: (json['netSavings'] as num?)?.toDouble() ?? 0,
      totalTransactions: json['totalTransactions'] as int? ?? 0,
      bestMonth: json['bestMonth'] as Map<String, dynamic>?,
      worstMonth: json['worstMonth'] as Map<String, dynamic>?,
      highestIncomeMonth: json['highestIncomeMonth'] as Map<String, dynamic>?,
      highestExpenseMonth: json['highestExpenseMonth'] as Map<String, dynamic>?,
      avgMonthlySpend: (json['avgMonthlySpend'] as num?)?.toDouble() ?? 0,
      avgDaily: (json['avgDaily'] as num?)?.toDouble() ?? 0,
      monthsWithData: json['monthsWithData'] as int? ?? 0,
      monthly: (json['monthly'] as List<dynamic>?)
              ?.map((e) => MonthlyData.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class MonthlyData {
  final int month;
  final double income;
  final double expense;
  final int count;

  MonthlyData({
    required this.month,
    this.income = 0,
    this.expense = 0,
    this.count = 0,
  });

  factory MonthlyData.fromJson(Map<String, dynamic> json) {
    return MonthlyData(
      month: json['month'] as int? ?? 1,
      income: (json['income'] as num?)?.toDouble() ?? 0,
      expense: (json['expense'] as num?)?.toDouble() ?? 0,
      count: json['count'] as int? ?? 0,
    );
  }
}

class CategorySpending {
  final String categoryName;
  final double total;
  final int count;
  final double percentage;

  CategorySpending({
    required this.categoryName,
    this.total = 0,
    this.count = 0,
    this.percentage = 0,
  });

  factory CategorySpending.fromJson(Map<String, dynamic> json) {
    return CategorySpending(
      categoryName: json['categoryName'] as String? ?? '',
      total: (json['total'] as num?)?.toDouble() ?? 0,
      count: json['count'] as int? ?? 0,
      percentage: (json['percentage'] as num?)?.toDouble() ?? 0,
    );
  }
}

class MerchantSpending {
  final String name;
  final double total;
  final int count;

  MerchantSpending({
    required this.name,
    this.total = 0,
    this.count = 0,
  });

  factory MerchantSpending.fromJson(Map<String, dynamic> json) {
    return MerchantSpending(
      name: json['name'] as String? ?? '',
      total: (json['total'] as num?)?.toDouble() ?? 0,
      count: json['count'] as int? ?? 0,
    );
  }
}

class BankDistribution {
  final String name;
  final double total;
  final int count;
  final double percentage;

  BankDistribution({
    required this.name,
    this.total = 0,
    this.count = 0,
    this.percentage = 0,
  });

  factory BankDistribution.fromJson(Map<String, dynamic> json) {
    return BankDistribution(
      name: json['name'] as String? ?? '',
      total: (json['total'] as num?)?.toDouble() ?? 0,
      count: json['count'] as int? ?? 0,
      percentage: (json['percentage'] as num?)?.toDouble() ?? 0,
    );
  }
}

class CardSpending {
  final String bank;
  final String cardType;
  final double total;
  final int count;

  CardSpending({
    required this.bank,
    required this.cardType,
    this.total = 0,
    this.count = 0,
  });

  factory CardSpending.fromJson(Map<String, dynamic> json) {
    return CardSpending(
      bank: json['bank'] as String? ?? '',
      cardType: json['cardType'] as String? ?? '',
      total: (json['total'] as num?)?.toDouble() ?? 0,
      count: json['count'] as int? ?? 0,
    );
  }
}
