import template from './calc.html';

let calcComponent = {
  template,
  controller: function($scope, $location) {
    this.year = 2017;
    if($location.search().year && [2015, 2016, 2017].indexOf(+$location.search().year) !== -1) {
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
      'generalCredit': 'General Tax Credit',
      'labourCredit': 'Labour Tax Credit',
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
        // this.salary.generalCredit = getAlgemeneHeffingskorting(this.salary.taxableYear);
        // this.salary.labourCredit = getArbeidskorting(this.salary.taxableYear);
        this.salary.grossMonth = ~~(grossYear / 12);
        this.salary.netYear = grossYear - getTaxAmount(this.salary.taxableYear, this.year);
        // this.salary.netYear += this.salary.generalCredit + this.salary.labourCredit;
        this.salary.netMonth = ~~(this.salary.netYear / 12);
        this.salary.incomeTax = getTaxAmount(this.salary.taxableYear, this.year);
      });

    function getMinimumDeduction(year) {
      let amount = {
          2015: 89050,
          2016: 91450,
          2017: 94750
      };
      return amount[year];
    }

    function getIncomeRate(year) {
      let rate = {
          2015: 0.25,
          2016: 0.25,
          2017: 0.24
      };
      return rate[year];
    }

    function getTaxRates(ratesYear) {
      let taxRates = {
        2015 : {
          normal: [.365, .42, .42, .52],
          withoutSocial: [.0835, .1385, .42, .52],
          over64: [0.1860, 0.2410, .42, .52]
        },
        2016 : {
          normal: [.3655, .404, .404, .52],
          withoutSocial: [.0835, .1385, .404, .52],
          over64: [0.1860, 0.2250, .404, .52]
        },
        2017 : {
          normal: [0, 0.0093, 0.0241, 0.1152, 0.1452],
        }
      }, currentTaxRates = taxRates[ratesYear]['normal'];

      return currentTaxRates;
    }

    function getTaxAmountPeriods(year) {
      const taxAmountPeriods = {
        2015:[
          19822, // 0 - 19,822
          13767, // 33,589 - 19,822
          23996, // 57,585 - 33,589
          Infinity
        ],
        2016:[
          19922, // 0 - 19,922
          13793, // 33,715 - 19,922
          32697, // 66,421 - 33,715
          Infinity
        ],
        2017:[
          164100, // 164,100 - 0
          66849, // 230,950 - 164,101
          349699, // 580,650 - 230,951 
          353399, // 934,050 - 580,651 
          Infinity, 
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

    //labor discount
    function getArbeidskorting(salary){
      if(salary < 9147){
        return salary * 1.793 / 100;
      }
      if(salary < 19758){
        return 164 + (salary - 9147) * 27.698 / 100;
      }
      if(salary < 34015){
        return 3103;
      }
      if(salary < 111590){
        return 3103 - (salary - 34015) * 4 / 100;
      }

      return 0;
    }

    //general discount
    function getAlgemeneHeffingskorting(salary) {
      if(salary < 19922){
        return 2242;
      }
      if(salary < 66417){
        return 2242 - (salary - 19922) * 4.822 / 100;
      }

      return 0;
    }

  }
};

export default calcComponent;
