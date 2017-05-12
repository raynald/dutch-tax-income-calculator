import template from './calc.html';

let calcComponent = {
  template,
  controller: function($scope, $location) {
    this.year = 2017;
    if($location.search().year && [2016, 2017].indexOf(+$location.search().year) !== -1) {
      this.year = +$location.search().year;
    }

    this.startFrom = 'year';
    if(['year', 'month'].indexOf($location.search().startFrom) !==-1){
      this.startFrom = $location.search().startFrom;
    }

    this.salary = {
      grossYear: 0,
      grossMonth: 0,
      netYear: 0,
      netMonth: 0,
      taxRate: 0
    };

    this.salary.grossYear = 400000;
    if(+$location.search().salary){
      this.salary.grossYear = +$location.search().salary;
    }

    this.salaryOutputOptions = {
      'taxableYear': 'Taxable Income',
      'incomeTax': 'Income Tax',
      'netYear': 'Year net income',
      'netMonth': 'Monthly net income'
    };

    $scope.$watchGroup([
        '$ctrl.startFrom',
        '$ctrl.salary.grossYear',
        '$ctrl.year'],
      () => {

        $location.search('startFrom', this.startFrom);
        $location.search('salary', this.salary.grossYear);
        $location.search('year', this.year);

        let grossYear = this.salary.grossYear || 0;
        this.salary.taxableYear = grossYear;
        this.salary.grossMonth = ~~(grossYear / 12);
        this.salary.netYear = grossYear - getTaxAmount(this.salary.taxableYear, this.year);
        this.salary.netMonth = ~~(this.salary.netYear / 12);
        this.salary.incomeTax = getTaxAmount(this.salary.taxableYear, this.year);
      });

    function getMinimumDeduction(year) {
      let amount = {
          2016: 91450,
          2017: 94750
      };
      return amount[year];
    }

    function getIncomeRate(year) {
      let rate = {
          2016: 0.25,
          2017: 0.24
      };
      return rate[year];
    }

    function getTaxRates(ratesYear) {
      let taxRates = {
        2016 : {
          normal: [0, 0.0044, 0.017, 0.107, 0.137],
        },
        2017 : {
          normal: [0, 0.0093, 0.0241, 0.1152, 0.1452],
        }
      }, currentTaxRates = taxRates[ratesYear]['normal'];

      return currentTaxRates;
    }

    function getTaxAmountPeriods(year) {
      const taxAmountPeriods = {
        2016:[
          159800, // 159800 - 0
          65100, // 224900 - 159800
          340500, // 565400 - 224900
          344100, // 909500 - 565400
          Infinity
        ],
        2017:[
          164100, // 164,100 - 0
          66850, // 230,950 - 164,100
          349700, // 580,650 - 230,950 
          353400, // 934,050 - 580,650 
          Infinity
        ],
      };

      return taxAmountPeriods[year];
    }

    function getTaxAmount(taxableIncome, ratesYear) {

      const taxAmountPeriods = getTaxAmountPeriods(ratesYear);
      const taxRates = getTaxRates(ratesYear);
      let taxAmount = taxableIncome * 0.082 + (taxableIncome - getMinimumDeduction(ratesYear)) * getIncomeRate(ratesYear);

      for (let i = 0; i < taxRates.length; i++) {
        if (taxableIncome - taxAmountPeriods[i] < 0) {
          taxAmount += taxableIncome * taxRates[i];
          break;
        } else {
          taxAmount += taxAmountPeriods[i] * taxRates[i];
          taxableIncome = taxableIncome - taxAmountPeriods[i];
        }
      }
      return taxAmount;
    }
  }
};

export default calcComponent;
